import * as agGridEnterprise from 'ag-grid-enterprise';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    RowAutoHeightModule,
    themeQuartz,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import '@/helpers/agGridLicense';
import '@/helpers/agGridTheme.css';
import { h } from 'vue';
import { AgGridVue as BaseGrid } from 'ag-grid-vue3';

// Register the same AG Grid module set used by the Vue component.  Enterprise
// currently auto-registers these modules, but explicit registration prevents
// version/module validation errors when the wrapper is code-split.
ModuleRegistry.registerModules([
    AllEnterpriseModule,
    ClientSideRowModelModule,
    DateFilterModule,
    NumberFilterModule,
    RowAutoHeightModule,
    TextFilterModule,
    ValidationModule,
]);

// Shared visual theme adapted from LES-UI's AG Grid theme.  LES-UI uses the
// AG Grid 31 legacy Alpine stylesheet, while this project uses AG Grid 36's
// Theming API, so the same design tokens live here instead of legacy CSS
// variables on the grid element.
export const appGridTheme = themeQuartz.withParams({
    fontFamily: 'inherit',
    fontSize: 13,
    foregroundColor: 'var(--vz-body-color, #212529)',
    dataColor: 'var(--vz-body-color, #212529)',
    backgroundColor: 'var(--vz-card-bg, #fff)',
    headerBackgroundColor: 'var(--vz-card-bg, #fff)',
    headerTextColor: 'var(--vz-secondary-color, #9aa1af)',
    oddRowBackgroundColor: 'var(--vz-card-bg, #fff)',
    rowHoverColor: 'rgba(246, 146, 30, 0.05)',
    selectedRowBackgroundColor: 'rgba(246, 146, 30, 0.10)',
    borderColor: 'var(--vz-border-color, #e9ebf0)',
    rowBorder: { style: 'solid', width: 1, color: 'var(--vz-border-color, #f0f2f5)' },
    headerRowBorder: { style: 'solid', width: 1, color: 'var(--vz-border-color, #e9ebf0)' },
    pinnedRowBorder: { style: 'solid', width: 1, color: 'var(--vz-border-color, #e9ebf0)' },
    headerColumnBorder: { style: 'solid', width: 1, color: '#eceef2' },
    headerColumnResizeHandleColor: '#dfe2e8',
    accentColor: '#f6921e',
    wrapperBorderRadius: 12,
    borderRadius: 12,
    cellHorizontalPadding: 16,
    spacing: 6,
    iconSize: 15,
    headerHeight: 48,
    rowHeight: 42,
});

// Every <ag-grid-vue> in the app goes through this wrapper, which gives all grids the same look
// and behaviour: framed card, pagination with a page-size picker, an empty-state
// card and an "N … loaded" caption. Anything a page passes itself still wins.
const PAGE_SIZE = 25;

// Column options that may name a Vue component registered on the page
const COMPONENT_KEYS = ['cellRenderer', 'cellEditor', 'headerComponent', 'tooltipComponent', 'filter', 'floatingFilterComponent'];

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const AgGridVue = {
    name: 'AppGrid',
    inheritAttrs: false,
    props: {
        // What the rows are, for "No users found" / "12 users loaded" (default: the page title)
        itemName: { type: String, default: '' },
        showCaption: { type: Boolean, default: true },
    },
    data() {
        return { total: null, loading: true };
    },
    computed: {
        noun() {
            // "Users List" → "users"
            return (this.itemName || this.$route?.meta?.title || 'records').replace(/\s+list$/i, '').toLowerCase();
        },
        options() {
            const attrs = this.$attrs;
            const pagination = attrs.pagination !== undefined ? attrs.pagination !== false : true;
            const pageSize = Number(attrs.paginationPageSize || attrs['pagination-page-size'] || PAGE_SIZE);
            const serverSide = (attrs.rowModelType || attrs['row-model-type']) === 'serverSide';
            const defaults = {
                pagination,
                paginationPageSize: pageSize,
                paginationPageSizeSelector: [10, 25, 50, 100],
                theme: appGridTheme,
                // Row grouping is off by default (the server-side grids don't support it);
                // a grid can turn the "Drag here to set row groups" bar on with rowGroupPanelShow="always"
                rowGroupPanelShow: 'never',
                rowHeight: 42,
                headerHeight: 48,
                animateRows: true,
                suppressCellFocus: true,
                overlayNoRowsTemplate:
                    `<div class="app-grid-empty"><i class="ri-inbox-line"></i><span>No ${escapeHtml(this.noun)} found</span></div>`,
                overlayLoadingTemplate:
                    '<div class="app-grid-empty is-loading"><span class="spinner-border spinner-border-sm"></span><span>Loading…</span></div>',
            };
            const merged = { ...defaults, ...attrs };
            if (merged.columnDefs) merged.columnDefs = this.resolveColumns(merged.columnDefs);
            if (merged.defaultColDef) merged.defaultColDef = this.resolveColumn(merged.defaultColDef);
            // Server-side + pagination: fetch exactly one page per request
            if (serverSide && pagination) {
                merged.cacheBlockSize = pageSize;
                delete merged['cache-block-size'];
                delete merged.maxBlocksInCache;
                delete merged['max-blocks-in-cache'];
            }
            delete merged.class;
            delete merged.style;
            delete merged.onGridReady;
            delete merged['onGrid-ready'];
            return merged;
        },
    },
    methods: {
        // "ActionRenderer" → the component the page registered under that name
        findComponent(name) {
            for (let p = this.$parent, depth = 0; p && depth < 15; p = p.$parent, depth++) {
                const found = p.$options?.components?.[name];
                if (found) return found;
            }
            return this.$.appContext.components[name] || null;
        },
        resolveColumn(col) {
            let out = col;
            COMPONENT_KEYS.forEach((key) => {
                const value = col[key];
                // Built-in AG Grid names (agTextColumnFilter, agSetColumnFilter…) stay as they are
                if (typeof value === 'string' && !value.startsWith('ag')) {
                    const component = this.findComponent(value);
                    if (component) out = { ...out, [key]: component };
                }
            });
            if (Array.isArray(col.children)) out = { ...out, children: this.resolveColumns(col.children) };
            return out;
        },
        resolveColumns(cols) {
            return (cols || []).map((col) => this.resolveColumn(col));
        },
        onGridReady(params) {
            this.api = params.api;
            const update = () => this.refreshState();
            params.api.addEventListener('modelUpdated', update);
            params.api.addEventListener('paginationChanged', update);
            const handler = this.$attrs.onGridReady || this.$attrs['onGrid-ready'];
            (Array.isArray(handler) ? handler : [handler]).forEach((fn) => typeof fn === 'function' && fn(params));
        },
        refreshState() {
            const api = this.api;
            if (!api || api.isDestroyed?.()) return;
            let rows = 0;
            api.forEachNode((node) => { if (node.data !== undefined && !node.group) rows++; });
            const pagination = this.$attrs.pagination !== false && this.$attrs.pagination !== 'false';
            const known = api.paginationIsLastPageFound ? api.paginationIsLastPageFound() : true;
            this.total = known ? api.paginationGetRowCount() : null;
            if (!pagination) this.total = rows;
            this.loading = false;
            // The server-side model doesn't show "no rows" on its own
            if (api.getDisplayedRowCount() === 0 || (known && this.total === 0)) api.showNoRowsOverlay();
            else if (rows) api.hideOverlay();
        },
    },
    render() {
        const caption = this.total === null ? '' : `${this.total.toLocaleString()} ${this.noun} loaded`;
        return h('div', { class: 'app-grid' }, [
            h(BaseGrid, {
                ...this.options,
                class: ['ag-theme-alpine', 'app-grid__grid', this.$attrs.class].filter(Boolean),
                style: this.$attrs.style,
                onGridReady: this.onGridReady,
            }, this.$slots),
            this.showCaption ? h('div', { class: 'app-grid__caption' }, caption) : null,
        ]);
    },
};

export function installAgGrid(app) {
    app.component('AgGridVue', AgGridVue);
    app.component('ag-grid-vue', AgGridVue);
    app.config.globalProperties.$agGrid = agGridEnterprise;
    app.provide('agGrid', agGridEnterprise);
}
