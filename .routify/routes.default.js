

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
      "id": "_default_api",
      "name": "api",
      "module": false,
      "file": {
        "path": "src/routes/api",
        "dir": "src/routes",
        "base": "api",
        "ext": "",
        "name": "api"
      },
      "children": [
        {
          "meta": {},
          "id": "_default_api_save",
          "name": "save",
          "module": false,
          "file": {
            "path": "src/routes/api/save",
            "dir": "src/routes/api",
            "base": "save",
            "ext": "",
            "name": "save"
          },
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_browse",
      "name": "browse",
      "module": false,
      "file": {
        "path": "src/routes/browse",
        "dir": "src/routes",
        "base": "browse",
        "ext": "",
        "name": "browse"
      },
      "children": [
        {
          "meta": {
            "dynamic": true,
            "order": false,
            "dynamicSpread": true
          },
          "id": "_default_browse_____path_",
          "name": "[...path]",
          "module": false,
          "file": {
            "path": "src/routes/browse/[...path]",
            "dir": "src/routes/browse",
            "base": "[...path]",
            "ext": ".path]",
            "name": "[...path]"
          },
          "children": [
            {
              "meta": {},
              "id": "_default_browse_____path___error_svelte",
              "name": "+error",
              "file": {
                "path": "src/routes/browse/[...path]/+error.svelte",
                "dir": "src/routes/browse/[...path]",
                "base": "+error.svelte",
                "ext": ".svelte",
                "name": "+error"
              },
              "asyncModule": () => import('../src/routes/browse/[...path]/+error.svelte'),
              "children": []
            },
            {
              "meta": {},
              "id": "_default_browse_____path___page_svelte",
              "name": "+page",
              "file": {
                "path": "src/routes/browse/[...path]/+page.svelte",
                "dir": "src/routes/browse/[...path]",
                "base": "+page.svelte",
                "ext": ".svelte",
                "name": "+page"
              },
              "asyncModule": () => import('../src/routes/browse/[...path]/+page.svelte'),
              "children": []
            }
          ]
        }
      ]
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
      "meta": {},
      "id": "_default_login",
      "name": "login",
      "module": false,
      "file": {
        "path": "src/routes/login",
        "dir": "src/routes",
        "base": "login",
        "ext": "",
        "name": "login"
      },
      "children": [
        {
          "meta": {},
          "id": "_default_login__page_svelte",
          "name": "+page",
          "file": {
            "path": "src/routes/login/+page.svelte",
            "dir": "src/routes/login",
            "base": "+page.svelte",
            "ext": ".svelte",
            "name": "+page"
          },
          "asyncModule": () => import('../src/routes/login/+page.svelte'),
          "children": []
        }
      ]
    },
    {
      "meta": {},
      "id": "_default_signin",
      "name": "signin",
      "module": false,
      "file": {
        "path": "src/routes/signin",
        "dir": "src/routes",
        "base": "signin",
        "ext": "",
        "name": "signin"
      },
      "children": []
    },
    {
      "meta": {},
      "id": "_default_signout",
      "name": "signout",
      "module": false,
      "file": {
        "path": "src/routes/signout",
        "dir": "src/routes",
        "base": "signout",
        "ext": "",
        "name": "signout"
      },
      "children": []
    },
    {
      "meta": {},
      "id": "_default_user",
      "name": "user",
      "module": false,
      "file": {
        "path": "src/routes/user",
        "dir": "src/routes",
        "base": "user",
        "ext": "",
        "name": "user"
      },
      "children": [
        {
          "meta": {},
          "id": "_default_user__page_svelte",
          "name": "+page",
          "file": {
            "path": "src/routes/user/+page.svelte",
            "dir": "src/routes/user",
            "base": "+page.svelte",
            "ext": ".svelte",
            "name": "+page"
          },
          "asyncModule": () => import('../src/routes/user/+page.svelte'),
          "children": []
        },
        {
          "meta": {},
          "id": "_default_user_keys",
          "name": "keys",
          "module": false,
          "file": {
            "path": "src/routes/user/keys",
            "dir": "src/routes/user",
            "base": "keys",
            "ext": "",
            "name": "keys"
          },
          "children": [
            {
              "meta": {},
              "id": "_default_user_keys__page_svelte",
              "name": "+page",
              "file": {
                "path": "src/routes/user/keys/+page.svelte",
                "dir": "src/routes/user/keys",
                "base": "+page.svelte",
                "ext": ".svelte",
                "name": "+page"
              },
              "asyncModule": () => import('../src/routes/user/keys/+page.svelte'),
              "children": []
            }
          ]
        }
      ]
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