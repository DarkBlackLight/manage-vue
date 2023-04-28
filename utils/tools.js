import moment from "moment/moment";


export const formatDateTime = (data) => {
    return moment(data).format("YYYY-MM-DD HH:mm:ss");
}

export const formatDate = (data) => {
    return moment(data).format("YYYY-MM-DD HH:mm:ss");
}
// 通用判断传入的多个值是否为空的方法（包含对象、数组、字符串、null、undefined，为空返回false，不为空返回true）
export const isEmpty = (item) => {
    // for (let i = 0; i < data.length; i++) {
    //     let item = data[i];
    if (item === null || item === undefined || item === '' || item === 'undefined') {
        return false;
    } else if (Array.isArray(item) && item.length === 0) {
        return false;
    } else if (typeof item === 'object' && Object.keys(item).length === 0) {
        return false;
    } else {
        return true;
    }
    // }

    // return flag;
    //     console.log(val)
    //     let type = typeof val;
    //     console.log(type)
    //     if (type === 'string') {
    //         return val.trim().length > 0
    //     } else if (type === 'undefined') {
    //         return false
    //     } else if (type === 'object') {
    //         if (Array.isArray(val)) {
    //             return val.length > 0
    //         } else if (val === null) {
    //             return false
    //         } else {
    //             console.log(Object.keys(val).length > 0)
    //             return Object.keys(val).length > 0
    //         }
    //     }
}
