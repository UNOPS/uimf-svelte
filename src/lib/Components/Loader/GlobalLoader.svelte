<script lang="ts">
  export let visible = false;
</script>

{#if visible}
  <div class="uimf-loader" role="alert" aria-live="assertive" aria-busy="true">
    <div class="uimf-loader__overlay" aria-hidden="true"></div>
    <div class="uimf-loader__spinner" aria-hidden="true">
      <div class="uimf-loader__dot uimf-loader__dot--1"></div>
      <div class="uimf-loader__dot uimf-loader__dot--2"></div>
      <div class="uimf-loader__dot uimf-loader__dot--3"></div>
      <div class="uimf-loader__dot uimf-loader__dot--4"></div>
      <div class="uimf-loader__dot uimf-loader__dot--5"></div>
      <div class="uimf-loader__dot uimf-loader__dot--6"></div>
      <div class="uimf-loader__dot uimf-loader__dot--7"></div>
      <div class="uimf-loader__dot uimf-loader__dot--8"></div>
    </div>
  </div>
{/if}

<style>
  .uimf-loader {
    position: fixed;
    inset: 0;
    z-index: 9998;
    pointer-events: auto;
  }

  .uimf-loader__overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.75);
    pointer-events: auto;
  }

  .uimf-loader__spinner {
    position: absolute;
    top: 33%;
    left: 47%;
    width: 98px;
    height: 98px;
    pointer-events: none;
  }

  .uimf-loader__dot {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 29px;
    background-color: #232c65;
    animation: uimf-loader-bounce 0.932s infinite normal;
    transform: scale(1);
  }

  .uimf-loader__dot--1 {
    left: 39px;
    top: 7px;
    animation-delay: 0.3495s;
  }

  .uimf-loader__dot--2 {
    left: 60px;
    top: 23px;
    animation-delay: 0.466s;
  }

  .uimf-loader__dot--3 {
    left: 72px;
    top: 44px;
    animation-delay: 0.5825s;
  }

  .uimf-loader__dot--4 {
    left: 67px;
    top: 65px;
    animation-delay: 0.699s;
  }

  .uimf-loader__dot--5 {
    left: 41px;
    top: 72px;
    animation-delay: 0.8155s;
  }

  .uimf-loader__dot--6 {
    left: 8px;
    top: 47px;
    animation-delay: 0.932s;
  }

  .uimf-loader__dot--7 {
    left: 0;
    top: 13px;
    animation-delay: 1.0485s;
  }

  .uimf-loader__dot--8 {
    left: 16px;
    top: 0;
    animation-delay: 1.165s;
  }

  @keyframes uimf-loader-bounce {
    0% {
      transform: scale(1);
      background-color: #232c65;
    }

    100% {
      transform: scale(0.3);
      background-color: #bdc0d1;
    }
  }
</style>

