<script setup lang="ts">
import { ref } from 'vue';
import robotImage from '../assets/robot.png';
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const userStore = useUserStore();

const name = ref('');
const email = ref('');
const loading = ref(false);
const error = ref('');

const createUser = async () => {
    if(!email.value || !name.value) {
        error.value = 'Name and email are required.';
        return;
    } 
    loading.value = true;
    error.value = '';

    try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/register-user`, {
            name: name.value,
            email: email.value
        });
        userStore.setUser({userId: data.userId, name: data.name});
        router.push('/chat');
    } catch(e) {
        error.value = 'Unable to register user. Please try again.'
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div class="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <img :src="robotImage" class="mx-auto w-24 h-24 mb-4" />
            <h1 class="text-2xl font-semibold mb-4 text-center">
                Welcome to Gossip.
            </h1>
            <input
                v-model="name" 
                placeholder="Name"
                class="w-full p-2 mt-4 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none" 
            />
            <input
                type="email"
                v-model="email" 
                placeholder="Email"
                class="w-full p-2 mt-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none" 
            />
            <button
                @click="createUser"
                :disabled="loading" 
                class="w-full p-2 mt-3 bg-blue-500 rounded-lg hover:cursor-pointer"
            >
                {{ loading ? 'Loggin In' : 'Start Chat' }}
            </button>
            <p v-if="error" class="text-red-400 text-center mt-4">
                {{ error }}
            </p>
        </div>
    </div>
</template>