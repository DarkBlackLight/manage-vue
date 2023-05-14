import moment from "moment";

export const formatDateTime = (data) => {
    return moment(data).format("YYYY-MM-DD HH:mm:ss");
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
