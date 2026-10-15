<script>
import animationData from "@/components/widgets/hzomhqxz.json";
import Lottie from "@/components/widgets/lottie.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { getSystemConfiguration, getSystemLogo, fetchAndApplySystemConfiguration } from "@/helpers/themeConfig";

import "swiper/css";
import "swiper/css/autoplay";
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default {
    data() {
        return {
            defaultOptions: { animationData: animationData },
            Autoplay: Autoplay, Pagination: Pagination, Navigation: Navigation,
            pagination: {
                clickable: true,
                el: '.swiper-pagination',
                renderBullet: function (index, className) {
                    return '<span class=' + className + '>' + (index + 1) + '</span>';
                },
            },
            systemLogo: null,
            systemConfig: null,
        };
    },
    computed: {
        appName() {
            return this.systemConfig?.app_name || "Support Desk";
        },
        footerCopyright() {
            const year = new Date().getFullYear();
            if (this.systemConfig?.footer_copyright_text) {
                let text = this.systemConfig.footer_copyright_text;
                if (text.includes("{year}")) text = text.replace(/{year}/g, year);
                if (text.includes("{appName}")) text = text.replace(/{appName}/g, this.appName);
                return text;
            }
            return `© ${year} ${this.appName}. All rights reserved.`;
        },
    },
    async mounted() {
        this.systemLogo = getSystemLogo();
        this.systemConfig = getSystemConfiguration();
        const freshConfig = await fetchAndApplySystemConfiguration();
        if (freshConfig) {
            this.systemConfig = freshConfig;
            this.systemLogo = freshConfig.system_logo || null;
        }
    },
    components: {
        lottie: Lottie,
        Swiper,
        SwiperSlide,
    },
};
</script>

<template>
    <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div class="bg-overlay"></div>
        <div class="auth-page-content overflow-hidden pt-lg-5">
            <BContainer>
                <BRow>
                    <BCol lg="12">
                        <BCard no-body class="overflow-hidden card-bg-fill border-0 card-border-effect-none">
                            <BRow class="justify-content-center g-0">
                                <BCol lg="6">
                                    <div class="p-lg-5 p-4 auth-one-bg h-100">
                                        <div class="bg-overlay"></div>
                                        <div class="position-relative h-100 d-flex flex-column">
                                            <div class="mb-4">
                                                <router-link to="/" class="d-block">
                                                    <img v-if="systemLogo" :src="systemLogo" alt="System Logo" style="max-height: 40px; max-width: 180px; object-fit: contain;">
                                                    <img v-else src="/aai_logo.png" alt="" height="32" style="max-height: 40px; object-fit: contain;">
                                                </router-link>
                                            </div>
                                            <div class="mt-auto">
                                                <div class="mb-3">
                                                    <i class="ri-double-quotes-l display-4 text-success"></i>
                                                </div>

                                                <div id="qoutescarouselIndicators" class="carousel slide"
                                                    data-bs-ride="carousel">
                                                    <Swiper class=" text-center text-white pb-5"
                                                        :autoplay="{ delay: 3000, disableOnInteraction: false }"
                                                        :loop="true" :modules="[Autoplay, Navigation, Pagination]"
                                                        :pagination="{ clickable: true, el: '.swiper-pagination' }">
                                                        <swiper-slide>
                                                            <div class="active">
                                                                <p class="fs-15 fst-italic">" Great! Clean code, clean
                                                                    design, easy for customization. Thanks very much! "</p>
                                                            </div>
                                                        </swiper-slide>
                                                        <swiper-slide>
                                                            <div>
                                                                <p class="fs-15 fst-italic">" The theme is really great with
                                                                    an amazing customer support."</p>
                                                            </div>
                                                        </swiper-slide>
                                                        <swiper-slide>
                                                            <div>
                                                                <p class="fs-15 fst-italic">" Great! Clean code, clean
                                                                    design, easy for customization. Thanks very much! "</p>
                                                            </div>
                                                        </swiper-slide>
                                                        <div class="swiper-pagination"></div>
                                                    </Swiper>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </BCol>

                                <BCol lg="6">
                                    <div class="p-lg-5 p-4 text-center">
                                        <lottie colors="primary:#8c68cd,secondary:#4788ff" :options="defaultOptions"
                                            :height="180" :width="180" />

                                        <div class="mt-4 pt-2">
                                            <h5>You are Logged Out</h5>
                                            <p class="text-muted">Thank you for using <span
                                                    class="fw-semibold">{{ appName }}</span></p>
                                            <div class="mt-4">
                                                <router-link to="/login" class="btn btn-primary w-100">Sign
                                                    In</router-link>
                                            </div>
                                        </div>
                                    </div>
                                </BCol>
                            </BRow>
                        </BCard>
                    </BCol>

                </BRow>
            </BContainer>
        </div>

        <footer class="footer">
            <BContainer>
                <BRow>
                    <BCol lg="12">
                        <div class="text-center">
                            <p class="mb-0 text-muted">{{ footerCopyright }}</p>
                        </div>
                    </BCol>
                </BRow>
            </BContainer>
        </footer>
    </div>
</template>