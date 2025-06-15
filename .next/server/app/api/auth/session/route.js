"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/session/route";
exports.ids = ["app/api/auth/session/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fsession%2Froute&page=%2Fapi%2Fauth%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fsession%2Froute.ts&appDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fsession%2Froute&page=%2Fapi%2Fauth%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fsession%2Froute.ts&appDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_titan_projects_dhq_accommodation_hub_src_app_api_auth_session_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/session/route.ts */ \"(rsc)/./src/app/api/auth/session/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/session/route\",\n        pathname: \"/api/auth/session\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/session/route\"\n    },\n    resolvedPagePath: \"/Users/titan/projects/dhq-accommodation-hub/src/app/api/auth/session/route.ts\",\n    nextConfigOutput,\n    userland: _Users_titan_projects_dhq_accommodation_hub_src_app_api_auth_session_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/session/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGc2Vzc2lvbiUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXV0aCUyRnNlc3Npb24lMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGc2Vzc2lvbiUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnRpdGFuJTJGcHJvamVjdHMlMkZkaHEtYWNjb21tb2RhdGlvbi1odWIlMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGdGl0YW4lMkZwcm9qZWN0cyUyRmRocS1hY2NvbW1vZGF0aW9uLWh1YiZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDNkI7QUFDMUc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kaHEtYWNjb21tb2RhdGlvbi1odWIvPzFmZmYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3RpdGFuL3Byb2plY3RzL2RocS1hY2NvbW1vZGF0aW9uLWh1Yi9zcmMvYXBwL2FwaS9hdXRoL3Nlc3Npb24vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvc2Vzc2lvbi9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvc2Vzc2lvblwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9zZXNzaW9uL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3RpdGFuL3Byb2plY3RzL2RocS1hY2NvbW1vZGF0aW9uLWh1Yi9zcmMvYXBwL2FwaS9hdXRoL3Nlc3Npb24vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvc2Vzc2lvbi9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fsession%2Froute&page=%2Fapi%2Fauth%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fsession%2Froute.ts&appDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/session/route.ts":
/*!*******************************************!*\
  !*** ./src/app/api/auth/session/route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   dynamic: () => (/* binding */ dynamic)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\nconst dynamic = \"force-dynamic\";\n\n\n\nconst JWT_SECRET = process.env.JWT_SECRET || \"your-secret-key\";\nasync function GET(request) {\n    try {\n        // Get token from cookie\n        const token = request.cookies.get(\"auth-token\")?.value;\n        if (!token) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                user: null\n            });\n        }\n        // Verify token\n        const decoded = (0,jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__.verify)(token, JWT_SECRET);\n        // Check if decoded is an object with id\n        if (typeof decoded === \"string\" || !(\"id\" in decoded)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                user: null\n            });\n        }\n        // Get fresh user data\n        const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n            where: {\n                id: decoded.id\n            },\n            include: {\n                profile: true\n            }\n        });\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                user: null\n            });\n        }\n        // Remove sensitive data\n        const { hashedPassword: _, ...userWithoutPassword } = user;\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            user: userWithoutPassword,\n            session: {\n                user: userWithoutPassword,\n                expires: \"exp\" in decoded && typeof decoded.exp === \"number\" ? new Date(decoded.exp * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()\n            }\n        });\n    } catch (error) {\n        console.error(\"Session error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            user: null\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL3Nlc3Npb24vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQU8sTUFBTUEsVUFBVSxnQkFBZ0I7QUFFaUI7QUFDbEI7QUFDQTtBQUV0QyxNQUFNSSxhQUFhQyxRQUFRQyxHQUFHLENBQUNGLFVBQVUsSUFBSTtBQUV0QyxlQUFlRyxJQUFJQyxPQUFvQjtJQUM1QyxJQUFJO1FBQ0Ysd0JBQXdCO1FBQ3hCLE1BQU1DLFFBQVFELFFBQVFFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLGVBQWVDO1FBRWpELElBQUksQ0FBQ0gsT0FBTztZQUNWLE9BQU9SLHFEQUFZQSxDQUFDWSxJQUFJLENBQUM7Z0JBQUVDLE1BQU07WUFBSztRQUN4QztRQUVBLGVBQWU7UUFDZixNQUFNQyxVQUFVWixvREFBTUEsQ0FBQ00sT0FBT0w7UUFFOUIsd0NBQXdDO1FBQ3hDLElBQUksT0FBT1csWUFBWSxZQUFZLENBQUUsU0FBUUEsT0FBTSxHQUFJO1lBQ3JELE9BQU9kLHFEQUFZQSxDQUFDWSxJQUFJLENBQUM7Z0JBQUVDLE1BQU07WUFBSztRQUN4QztRQUVBLHNCQUFzQjtRQUN0QixNQUFNQSxPQUFPLE1BQU1aLCtDQUFNQSxDQUFDWSxJQUFJLENBQUNFLFVBQVUsQ0FBQztZQUN4Q0MsT0FBTztnQkFBRUMsSUFBSUgsUUFBUUcsRUFBRTtZQUFDO1lBQ3hCQyxTQUFTO2dCQUNQQyxTQUFTO1lBQ1g7UUFDRjtRQUVBLElBQUksQ0FBQ04sTUFBTTtZQUNULE9BQU9iLHFEQUFZQSxDQUFDWSxJQUFJLENBQUM7Z0JBQUVDLE1BQU07WUFBSztRQUN4QztRQUVBLHdCQUF3QjtRQUN4QixNQUFNLEVBQUVPLGdCQUFnQkMsQ0FBQyxFQUFFLEdBQUdDLHFCQUFxQixHQUFHVDtRQUV0RCxPQUFPYixxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDO1lBQ3ZCQyxNQUFNUztZQUNOQyxTQUFTO2dCQUNQVixNQUFNUztnQkFDTkUsU0FBUyxTQUFTVixXQUFXLE9BQU9BLFFBQVFXLEdBQUcsS0FBSyxXQUNoRCxJQUFJQyxLQUFLWixRQUFRVyxHQUFHLEdBQUcsTUFBTUUsV0FBVyxLQUN4QyxJQUFJRCxLQUFLQSxLQUFLRSxHQUFHLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTUQsV0FBVztZQUM1RDtRQUNGO0lBQ0YsRUFBRSxPQUFPRSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxrQkFBa0JBO1FBQ2hDLE9BQU83QixxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDO1lBQUVDLE1BQU07UUFBSztJQUN4QztBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZGhxLWFjY29tbW9kYXRpb24taHViLy4vc3JjL2FwcC9hcGkvYXV0aC9zZXNzaW9uL3JvdXRlLnRzP2MyYjYiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSBcImZvcmNlLWR5bmFtaWNcIjtcblxuaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuaW1wb3J0IHsgdmVyaWZ5IH0gZnJvbSBcImpzb253ZWJ0b2tlblwiO1xuXG5jb25zdCBKV1RfU0VDUkVUID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVCB8fCBcInlvdXItc2VjcmV0LWtleVwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgLy8gR2V0IHRva2VuIGZyb20gY29va2llXG4gICAgY29uc3QgdG9rZW4gPSByZXF1ZXN0LmNvb2tpZXMuZ2V0KFwiYXV0aC10b2tlblwiKT8udmFsdWU7XG5cbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1c2VyOiBudWxsIH0pO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSB0b2tlblxuICAgIGNvbnN0IGRlY29kZWQgPSB2ZXJpZnkodG9rZW4sIEpXVF9TRUNSRVQpO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIGRlY29kZWQgaXMgYW4gb2JqZWN0IHdpdGggaWRcbiAgICBpZiAodHlwZW9mIGRlY29kZWQgPT09ICdzdHJpbmcnIHx8ICEoJ2lkJyBpbiBkZWNvZGVkKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXNlcjogbnVsbCB9KTtcbiAgICB9XG5cbiAgICAvLyBHZXQgZnJlc2ggdXNlciBkYXRhXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IGRlY29kZWQuaWQgfSxcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgcHJvZmlsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyB1c2VyOiBudWxsIH0pO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBzZW5zaXRpdmUgZGF0YVxuICAgIGNvbnN0IHsgaGFzaGVkUGFzc3dvcmQ6IF8sIC4uLnVzZXJXaXRob3V0UGFzc3dvcmQgfSA9IHVzZXI7XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgdXNlcjogdXNlcldpdGhvdXRQYXNzd29yZCxcbiAgICAgIHNlc3Npb246IHtcbiAgICAgICAgdXNlcjogdXNlcldpdGhvdXRQYXNzd29yZCxcbiAgICAgICAgZXhwaXJlczogJ2V4cCcgaW4gZGVjb2RlZCAmJiB0eXBlb2YgZGVjb2RlZC5leHAgPT09ICdudW1iZXInIFxuICAgICAgICAgID8gbmV3IERhdGUoZGVjb2RlZC5leHAgKiAxMDAwKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgOiBuZXcgRGF0ZShEYXRlLm5vdygpICsgMjQgKiA2MCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKVxuICAgICAgfVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJTZXNzaW9uIGVycm9yOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXNlcjogbnVsbCB9KTtcbiAgfVxufSJdLCJuYW1lcyI6WyJkeW5hbWljIiwiTmV4dFJlc3BvbnNlIiwicHJpc21hIiwidmVyaWZ5IiwiSldUX1NFQ1JFVCIsInByb2Nlc3MiLCJlbnYiLCJHRVQiLCJyZXF1ZXN0IiwidG9rZW4iLCJjb29raWVzIiwiZ2V0IiwidmFsdWUiLCJqc29uIiwidXNlciIsImRlY29kZWQiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpZCIsImluY2x1ZGUiLCJwcm9maWxlIiwiaGFzaGVkUGFzc3dvcmQiLCJfIiwidXNlcldpdGhvdXRQYXNzd29yZCIsInNlc3Npb24iLCJleHBpcmVzIiwiZXhwIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwibm93IiwiZXJyb3IiLCJjb25zb2xlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/session/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBOEM7QUFFOUMsTUFBTUMsa0JBQWtCQztBQUlqQixNQUFNQyxTQUFTRixnQkFBZ0JFLE1BQU0sSUFBSSxJQUFJSCx3REFBWUEsR0FBRztBQUVuRSxJQUFJSSxJQUF5QixFQUFjSCxnQkFBZ0JFLE1BQU0sR0FBR0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kaHEtYWNjb21tb2RhdGlvbi1odWIvLi9zcmMvbGliL3ByaXNtYS50cz8wMWQ3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50JztcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHtcbiAgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hOyJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJpc21hIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/jsonwebtoken","vendor-chunks/jws","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/safe-buffer","vendor-chunks/ms","vendor-chunks/lodash.once","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isplainobject","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isinteger","vendor-chunks/lodash.isboolean","vendor-chunks/lodash.includes","vendor-chunks/jwa","vendor-chunks/buffer-equal-constant-time"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fsession%2Froute&page=%2Fapi%2Fauth%2Fsession%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fsession%2Froute.ts&appDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ftitan%2Fprojects%2Fdhq-accommodation-hub&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();