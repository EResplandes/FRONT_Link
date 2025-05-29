<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLayout } from '@/layout/composables/layout';

const route = useRoute();

const { layoutConfig, layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    }
});

const isActiveMenu = ref(false);
const itemKey = ref(null);

onBeforeMount(() => {
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
});

watch(
    () => layoutConfig.activeMenuItem.value,
    (newVal) => {
        isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
);
const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    const { overlayMenuActive, staticMenuMobileActive } = layoutState;

    if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
        onMenuToggle();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    setActiveMenuItem(foundItemKey);
};

const checkActiveRoute = (item) => {
    return route.path === item.to;
};
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">{{ item.label }}</div>
        <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item, index)" :class="item.class" :target="item.target" tabindex="0">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </a>
        <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveRoute(item) }]" tabindex="0" :to="item.to">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
        </router-link>
        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                <app-menu-item v-for="(child, i) in item.items" :key="child" :index="i" :item="child" :parentItemKey="itemKey" :root="false"></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped>
:root {
    --blue-50: #f0f9ff;
    --blue-100: #e0f2fe;
    --blue-200: #bae6fd;
    --blue-300: #7dd3fc;
    --blue-400: #38bdf8;
    --blue-500: #1d9df2;
    --blue-600: #1e40af;
    --blue-700: #1e3a8a;
    --blue-800: #1e2b58;
    --blue-900: #0f172a;
}

a,
.router-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: var(--blue-100);
    border-radius: 0.5rem;
    margin: 0.25rem 0.75rem;
    transition: all 0.3s ease;
    cursor: pointer;
    user-select: none;

    .layout-menuitem-icon {
        color: var(--blue-300);
        margin-right: 0.75rem;
        transition: all 0.3s ease;
    }

    .layout-menuitem-text {
        flex-grow: 1;
        transition: all 0.3s ease;
    }

    .layout-submenu-toggler {
        color: var(--blue-300);
        transition: all 0.3s ease;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.1);

        .layout-menuitem-icon,
        .layout-menuitem-text,
        .layout-submenu-toggler {
            color: white;
        }
    }
}
.active-menuitem > a,
.active-menuitem > .router-link,
.active-route {
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--blue-400);
        border-radius: 0 4px 4px 0;
    }

    .layout-menuitem-icon,
    .layout-menuitem-text,
    .layout-submenu-toggler {
        font-weight: 600;
    }
}
</style>
