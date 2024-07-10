<script lang="ts">
    export let message: string = '';
    export let isSuccess: boolean = true;
  
    let show = false;
  
    function showMessage(m: string, s: boolean) {
      show = true;
      // Update message and success flag
      message = m;
      isSuccess = s;
  
      // Hide the message after the animation
      setTimeout(() => {
        show = false;
      }, 2000); // Duration of the animation
    }
  </script>
  
  <style>
    .message {
      opacity: 0;
      transform: translateX(0);
      transition: opacity 0.5s ease, transform 0.5s ease;
      padding: 10px;
      border-radius: 5px;
      position: absolute;
      top: 10px;
      left: 10px;
    }
  
    .message.show {
      opacity: 1;
    }
  
    .message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
  
    .message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  
    .message.show {
      animation: moveLeftRight 0.5s ease forwards;
    }
  
    @keyframes moveLeftRight {
      0% { transform: translateX(0); }
      50% { transform: translateX(-10px); }
      100% { transform: translateX(0); }
    }
  </style>
  
  <div class={`message ${isSuccess ? 'success' : 'error'} ${show ? 'show' : ''}`}>
    {message}
  </div>
  