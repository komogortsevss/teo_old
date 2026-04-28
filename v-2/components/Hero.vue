<template>
  <section class="relative h-screen min-h-[600px] flex items-center overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img 
        :src="backgroundImage" 
        alt="Свежие цветы из Эквадора" 
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-6 md:px-12 relative z-10">
      <div class="max-w-2xl">
        <div class="">
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            Свежие цветы<br />из Эквадора
          </h2>
          <p class="text-lg md:text-xl text-white mb-8 drop-shadow-lg"><br></p>
          <button class="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
            Смотреть каталог
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const backgroundImage = 'https://sel.cdn-chatium.io/get/image_msk_h9OOK7w2sP.2754x1536.png'
</script>