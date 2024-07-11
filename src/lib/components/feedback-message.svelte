<script lang="ts">
    
    let message: string = '';
    let isSuccess: boolean = true;
    let timeout: any;
    let show = false;

    export const feedback = {
        showMessage(m: string, s: boolean) {

          clearTimeout(timeout);

          show = true;
          message = m;
          isSuccess = s;
      
          timeout = setTimeout(() => {
            show = false;
          }, 2000); // Duration of the animation
        },
        clearMessage() {
          clearTimeout(timeout);
          show = false;
        }
    }
  </script>
  
  <style>
    .message {
      opacity: 0;
      transform: translateX(0);
      transition: opacity 0.5s ease, transform 0.5s ease;
      border-radius: 0.5rem;
      padding: 0.6rem 1.25rem ;
      position: relative;
      font-size: 0.875rem;
      line-height: 1.25rem;
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
      50% { transform: translateX(-20px); }
      100% { transform: translateX(0); }
    }
  </style>
  
  <div class={`message ${isSuccess ? 'success' : 'error'} ${show ? 'show' : ''}`}>
    {message}
  </div>
  