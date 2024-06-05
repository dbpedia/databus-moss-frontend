

export default {
  "meta": {},
  "id": "_default",
  "name": "",
  "file": {
    "path": "src/routes",
    "dir": "src",
    "base": "routes",
    "ext": "",
    "name": "routes"
  },
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    {
      "meta": {},
      "id": "_default__layout_svelte",
      "name": "+layout",
      "file": {
        "path": "src/routes/+layout.svelte",
        "dir": "src/routes",
        "base": "+layout.svelte",
        "ext": ".svelte",
        "name": "+layout"
      },
      "asyncModule": () => import('../src/routes/+layout.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default__page_svelte",
      "name": "+page",
      "file": {
        "path": "src/routes/+page.svelte",
        "dir": "src/routes",
        "base": "+page.svelte",
        "ext": ".svelte",
        "name": "+page"
      },
      "asyncModule": () => import('../src/routes/+page.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_create_layer",
      "name": "create-layer",
      "module": false,
      "file": {
        "path": "src/routes/create-layer",
        "dir": "src/routes",
        "base": "create-layer",
        "ext": "",
        "name": "create-layer"
      },
      "children": [
        {
          "meta": {},
          "id": "_default_create_layer__page_svelte",
          "name": "+page",
          "file": {
            "path": "src/routes/create-layer/+page.svelte",
            "dir": "src/routes/create-layer",
            "base": "+page.svelte",
            "ext": ".svelte",
            "name": "+page"
          },
          "asyncModule": () => import('../src/routes/create-layer/+page.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_demo_svelte",
      "name": "demo",
      "file": {
        "path": "src/routes/demo.svelte",
        "dir": "src/routes",
        "base": "demo.svelte",
        "ext": ".svelte",
        "name": "demo"
      },
      "asyncModule": () => import('../src/routes/demo.svelte'),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_g",
      "name": "g",
      "module": false,
      "file": {
        "path": "src/routes/g",
        "dir": "src/routes",
        "base": "g",
        "ext": "",
        "name": "g"
      },
      "children": [
        {
          "meta": {
            "dynamic": true,
            "order": false,
            "dynamicSpread": true
          },
          "id": "_default_g_____path_",
          "name": "[...path]",
          "module": false,
          "file": {
            "path": "src/routes/g/[...path]",
            "dir": "src/routes/g",
            "base": "[...path]",
            "ext": ".path]",
            "name": "[...path]"
          },
          "children": [
            {
              "meta": {},
              "id": "_default_g_____path___error_svelte",
              "name": "+error",
              "file": {
                "path": "src/routes/g/[...path]/+error.svelte",
                "dir": "src/routes/g/[...path]",
                "base": "+error.svelte",
                "ext": ".svelte",
                "name": "+error"
              },
              "asyncModule": () => import('../src/routes/g/[...path]/+error.svelte'),
              "children": []
            },
            {
              "meta": {},
              "id": "_default_g_____path___page_svelte",
              "name": "+page",
              "file": {
                "path": "src/routes/g/[...path]/+page.svelte",
                "dir": "src/routes/g/[...path]",
                "base": "+page.svelte",
                "ext": ".svelte",
                "name": "+page"
              },
              "asyncModule": () => import('../src/routes/g/[...path]/+page.svelte'),
              "children": []
            }
          ]
        }
      ]
    },
    {
      "meta": {
        "isDefault": true
      },
      "id": "_default_index_svelte",
      "name": "index",
      "file": {
        "path": "src/routes/index.svelte",
        "dir": "src/routes",
        "base": "index.svelte",
        "ext": ".svelte",
        "name": "index"
      },
      "asyncModule": () => import('../src/routes/index.svelte'),
      "children": []
    },
    {
      "meta": {
        "dynamic": true,
        "dynamicSpread": true,
        "order": false,
        "inline": false
      },
      "name": "[...404]",
      "file": {
        "path": ".routify/components/[...404].svelte",
        "dir": ".routify/components",
        "base": "[...404].svelte",
        "ext": ".svelte",
        "name": "[...404]"
      },
      "asyncModule": () => import('./components/[...404].svelte'),
      "children": []
    }
  ]
}