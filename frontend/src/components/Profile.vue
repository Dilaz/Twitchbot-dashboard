<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="12" md="8">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Super Twitch modebot by Dilaz</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-progress-circular
            v-show="loading"
            indeterminate
            color="primary"
          ></v-progress-circular
        ></v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click.prevent="addBot"
            >Add bot to my channel!</v-btn
          >
          <v-btn color="red" @click.prevent="removeBot"
            >Remove bot from my channel!</v-btn
          >
          <v-spacer />
          <v-btn color="secondary" @click.prevent="logout">Logout!</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-snackbar v-model="error" :timeout="5000">
        Somehting went wrong! Try to log out and log back in and if the problem
        continues, contact
        <a href="https://twitter.com/Dilazi" target="_blank" ref="noopener"
          >Dilaz</a
        >.
        <template v-slot:action="{ attrs }">
          <v-btn color="blue" text v-bind="attrs" @click="error = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <v-snackbar v-model="success" :timeout="10000">
        {{ successText }}
        <template v-slot:action="{ attrs }">
          <v-btn color="blue" text v-bind="attrs" @click="success = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-col>
  </v-row>
</template>
<script>
import axios from "axios";

export default {
  created() {
    console.log("Profile!");
    if (!localStorage.token) {
      this.$router.push({ name: "login" });
    }
  },
  data: () => ({
    loading: false,
    success: false,
    error: false,
    timer: null,
    successText: "",
  }),
  methods: {
    async addBot() {
      const headers = {
        Authorization: `Bearer ${localStorage.token}`,
      };
      this.loading = true;

      try {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/addBot`,
          {},
          { headers }
        );
        this.showSuccess(true);
      } catch (e) {
        console.error(e);
        this.showError();
      } finally {
        this.loading = false;
      }
    },
    async removeBot() {
      const headers = {
        Authorization: `Bearer ${localStorage.token}`,
      };
      this.loading = true;
      try {
        await axios.post(
          `${process.env.VUE_APP_API_URL}/removeBot`,
          {},
          { headers }
        );
        this.showSuccess(false);
      } catch (e) {
        console.error(e);
        this.showError();
      } finally {
        this.loading = false;
      }
    },
    logout() {
      localStorage.token = "";
      this.$router.push({ name: "login" });
    },

    showError() {
      this.success = false;
      this.error = true;
    },
    showSuccess(add) {
      if (add) {
        this.$data.successText =
          'Bot has been added to your channel if it wasn\'t there before! To finish the setup, you need to type "/mod DeepLiveBot" in your Twitch chat.';
      } else {
        this.$data.successText = "Bot has been removed from your channel.";
      }
      this.error = false;
      this.success = true;
    },
  },
};
</script>