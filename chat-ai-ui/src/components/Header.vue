<script setup lang="ts">
import { useRouter } from 'vue-router';
import robotImage from '../assets/robot.png';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const logout = () => {
    userStore.logout();
    router.push('/');
}

</script>

<template>
    <div class="py-4 px-6 bg-gray-800 shadow-md flex justify-between items-center">
        <img :src="robotImage" alt="Gossip" class="w-8 h-8"/>
        <h1 class="text-lg font-semibold">Gossip.</h1>
        <button
            @click="logout" 
            class="text-gray-400 hover:text-white cursor-pointer">Logout</button>
    </div>
</template>