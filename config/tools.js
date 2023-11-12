import moment from "moment";
import {ElMessage} from "element-plus";

export const formatDateTime = (data) => {
    if (data)
        return moment(data).format("YYYY-MM-DD HH:mm:ss");
    else
        return null
}

export const formatDate = (data) => {
    return moment(data).format("YYYY-MM-DD");
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
    const str = '#' + text
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
