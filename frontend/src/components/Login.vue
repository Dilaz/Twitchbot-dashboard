<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Login with Twitch</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <span>Source</span>
          </v-tooltip>
        </v-toolbar>
        <v-card-text> </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click.prevent="login"
            ><icon-base icon-name="twitch" viewBox="0 0 2400 2800"
              ><icon-twitch /></icon-base
            >&nbsp; Login
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {
    if (localStorage.token || this.$route.params?.token) {
      localStorage.token = this.$route.params.token;
      this.$nextTick(() => this.$router.push({ name: "profile" }));
    }
  },
  methods: {
    login() {
      console.debug(`redirect to ${process.env.VUE_APP_API_URL}/oauth/init`);
      document.location.href = `${process.env.VUE_APP_API_URL}/oauth/init`;
    },
  },
};
</script>