<template>
  <div class='hello'>
    <h1>{{ msg }}</h1>
    <p>Updates State: {{ state }}</p>
    <button @click="onUpgrade">更新</button>
  </div>
</template>
<script>
export default {
  name: 'HelloWorld',
  data: function() {
    return {
      state: 'Thinking…',
    };
  },
  props: {
    msg: String,
  },
  methods: {
    onUpgrade() {
      window.ipcRenderer.send('upgrade')
    }
  },
  mounted() {
    window.ipcRenderer.on('updater', (event, message) => {
      switch (message) {
        case 'update_available':
          console.log('available')
          this.state = 'Available';
          break;
        case 'update_not_available':
          console.log('update_not_available')
          this.state = 'Not Available';
          break;
        default:
          console.log(message)
          this.state = message
          break
      }
    });
  },
}
</script>
