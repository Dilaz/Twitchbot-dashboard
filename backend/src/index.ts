import * as express from 'express';
import * as passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';
import Axios from 'axios';
import * as jwt from 'jwt-simple';
import { connect, Connection, Channel as MqChannel } from 'amqplib'
import * as cors from 'cors';

dotenv.config();

const app = express()
const port = Number(process.env.PORT) || 3000;

app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: process.env.FRONTEND_URL,
}))

const router = express.Router();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  callbackURL: `${process.env.APP_URL}/oauth/callback`,
  scope: ['user:read:email'],
  passReqToCallback: true,

}, (req, accessToken, refreshToken, params, profile, done) => {
  console.log(profile, accessToken);
  const headers = {
    'client-id': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${accessToken}`,
  };

  return Axios.get('https://api.twitch.tv/helix/users', { headers })
    .then(res => res.data)
    .then(user => {
      const payload = {
        user,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7, //7 days
      };
      const token = jwt.encode(payload, process.env.JWT_SECRET);
      console.log(token);
      done(null, { token })
    })
}));

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

passport.use(new JwtStrategy(opts, function (jwtPayload, done) {
  return done(null, jwtPayload);
}));

app.get('/oauth/init', passport.authenticate('oauth2'));

app.get('/oauth/callback', passport.authenticate('oauth2', { failureRedirect: '/login' }), (req: express.Request, res: express.Response) => {
  return res.redirect(`${process.env.FRONTEND_URL}/login/${req.user['token']}`);
});



const main = async () => {
  const offlinePubQueue = [];

  const mqClient = await connect(process.env.MQ_URL || 'amqp://localhost', 'heartbeat=60');

  console.debug('MQ connection opened');

  const mqChannel = await mqClient.createConfirmChannel();

  console.debug('MQ channel create');

  await mqChannel.assertQueue(process.env.MQ_CHANNEL_NAME || 'channels', { durable: true });

  app.post('/addBot', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log(req.user['user']['data']);
    const channelName = req.user['user']['data'][0]['login'];

    if (!channelName) {
      return res.status(480).json({ status: 'error', message: 'Invalid channel name' });
    }

    const newChannelCommand = {
      type: 'newChannel',
      name: channelName,
    };

    mqChannel.publish('', process.env.MQ_CHANNEL_NAME, Buffer.from(JSON.stringify(newChannelCommand)), { persistent: true }, (err, ok) => {
      if (err) {
        console.error("[AMQP] publish", err);
        // offlinePubQueue.push([exchange, routingKey, content]);
      }

      return res.json({ foo: 'bar' })
    });
  });

  app.post('/removeBot', passport.authenticate('jwt', { session: false }), (req, res) => {
    const channelName = req.user['user']['data'][0]['login'];

    if (!channelName) {
      return res.status(480).json({ status: 'error', message: 'Invalid channel name' });
    }

    const deleteChannelCommand = {
      type: 'deleteChannel',
      name: channelName,
    };

    mqChannel.publish('', process.env.MQ_CHANNEL_NAME, Buffer.from(JSON.stringify(deleteChannelCommand)), { persistent: true }, (err, ok) => {
      if (err) {
        console.error("[AMQP] publish", err);
        // offlinePubQueue.push([exchange, routingKey, content]);
      }
      return res.json({ foo: 'bar' })
    });
  });

  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
  });
}

main().catch(err => {
  console.error(err);
  process.exit();
});
