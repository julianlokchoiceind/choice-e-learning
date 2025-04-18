"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_src_services_achievements_ts";
exports.ids = ["_ssr_src_services_achievements_ts"];
exports.modules = {

/***/ "(ssr)/./src/services/achievements.ts":
/*!**************************************!*\
  !*** ./src/services/achievements.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkAndAwardAchievements: () => (/* binding */ checkAndAwardAchievements),
/* harmony export */   createAchievement: () => (/* binding */ createAchievement),
/* harmony export */   getUserAchievements: () => (/* binding */ getUserAchievements)
/* harmony export */ });
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/client/app-call-server */ "(ssr)/./node_modules/next/dist/client/app-call-server.js");
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js");



function __build_action__(action, args) {
  return (0,next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__.callServer)(action.$$id, args)
}

/* __next_internal_action_entry_do_not_use__ {"346d3948bb54496414ac11ffe007a95bcc0ada67":"getUserAchievements","bc267e40bccb015e6b0a6920c9226658810c2a22":"checkAndAwardAchievements","d19bb8b7980f79348c3a6a62c6c3b436873341b7":"createAchievement"} */ var checkAndAwardAchievements = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("bc267e40bccb015e6b0a6920c9226658810c2a22");

var getUserAchievements = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("346d3948bb54496414ac11ffe007a95bcc0ada67");
var createAchievement = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("d19bb8b7980f79348c3a6a62c6c3b436873341b7");



/***/ })

};
;