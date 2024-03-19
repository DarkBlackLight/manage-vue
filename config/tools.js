import moment from "moment";
import {ElMessage} from "element-plus";

export const formatDateTime = (data) => {
    if (data)
        return moment(data).format("YYYY-MM-DD HH:mm:ss");
    else
        return null
}

export const formatDate = (data) => {
    if (data)
        return moment(data).format("YYYY-MM-DD");
    else
        return null
}

export const formatTime = (data) => {
    if (data)
        return moment(data).format("HH:mm:ss");
    else
        return null
}

export const isEmpty = (item) => {
    if (item === null || item === undefined || item === '' || item === 'undefined') {
        return false;
    } else if (Array.isArray(item) && item.length === 0) {
        return false;
    } else if (typeof item === 'object' && Object.keys(item).length === 0) {
        return false;
    } else {
        return true;
    }
}

export const CopyText = (text) => {
    //    复制text文字
    const str = text
    if (!navigator.clipboard) {
        const input = document.createElement('input');
        input.value = str;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy')
        document.body.removeChild(input);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            ElMessage({
                message: '复制成功',
                type: 'success'
            });
        } else {
            ElMessage({
                message: '复制失败',
                type: 'error'
            });
        }
    } else {
        navigator.clipboard.writeText(str).then(function () {
            ElMessage({
                message: '复制成功',
                type: 'success'
            });
        }).catch(function () {
            ElMessage({
                message: '复制失败',
                type: 'error'
            });
        });
    }
}

export const MobileUA = (function () {
    let ua = navigator.userAgent.toLowerCase();

    let mua = {
        IOS: /ipod|iphone|ipad/.test(ua), //iOS
        IPHONE: /iphone/.test(ua), //iPhone
        IPAD: /ipad/.test(ua), //iPad
        ANDROID: /android/.test(ua), //Android Device
        WINDOWS: /windows/.test(ua), //Windows Device
        TOUCH_DEVICE: ('ontouchstart' in window) || /touch/.test(ua), //Touch Device
        MOBILE: /mobile/.test(ua), //Mobile Device (iPad)
        ANDROID_TABLET: false, //Android Tablet
        WINDOWS_TABLET: false, //Windows Tablet
        TABLET: false, //Tablet (iPad, Android, Windows)
        SMART_PHONE: false //Smart Phone (iPhone, Android)
    };

    mua.ANDROID_TABLET = mua.ANDROID && !mua.MOBILE;
    mua.WINDOWS_TABLET = mua.WINDOWS && /tablet/.test(ua);
    mua.TABLET = mua.IPAD || mua.ANDROID_TABLET || mua.WINDOWS_TABLET;
    mua.SMART_PHONE = mua.MOBILE && !mua.TABLET;

    return mua;
}())