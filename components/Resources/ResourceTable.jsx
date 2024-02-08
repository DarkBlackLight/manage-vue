import {ref, watch, defineComponent, onMounted, nextTick} from "vue";
import {formatDateTime} from "../../config/tools";

import _ from 'lodash-es';

const renderItem = (column, scope) => {
    let p = column.prop ? column.prop.split('.') : [];
    let r = scope.row

    if (column.render)
        return column.render(r, column)
    else if (column.type === 'image') {
        return (
            _.get(r, p) && <img height={70} src={_.get(r, p).src}/>
        )
    } else if (column.type === 'datetime') {
        return <el-text>{formatDateTime(_.get(r, p))}</el-text>
    } else if (column.type === 'price') {
        return <el-text>${_.get(r, p).toFixed(2)}</el-text>
    } else {
        return (<el-text>{_.get(r, p)}</el-text>)
    }
}

const paginate = (data, pageSize, currentPage) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
}

export default defineComponent({
    name: 'ResourceTable',
    props: {
        columns: {
            type: Array,
            required: true
        },
        data: {
            type: Array
        },
        remote: {
            type: Function,
        },
        preprocess: {
            type: Function
        },
        enableSelection: {
            type: Boolean,
            default: true
        },
        filterRowSelections: {
            type: Function
        },
        page_size: {
            type: Number,
            default: 10
        },
        current_page: {
            type: Number,
            default: 1
        },
        tableProps: {
            type: Object
        },
        customTable: {
            type: Function
        },
    },
    emits: ['selectionChange'],
    setup(props, {expose, emit}) {

        const tableRef = ref(null);
        const loading = ref(false);

        const resources = ref([]);
        const resourcesTotal = ref(0);

        const pageSize = ref(props.page_size);
        const currentPage = ref(props.current_page);

        const getResourceList = () => {
            if (props.data) {
                resources.value = paginate(props.data, pageSize.value, currentPage.value);
                resourcesTotal.value = props.data.length;
            } else if (props.remote) {
                loading.value = true;
                props.remote({page_size: pageSize.value, page: currentPage.value}).then(async response => {
                    if (props.preprocess) {
                        response = props.preprocess(response);
                    }

                    resources.value = response.data;
                    resourcesTotal.value = response.total;

                    nextTick().then(() => {
                        if (tableRef.value && props.filterRowSelections) {
                            props.filterRowSelections(resources.value).forEach(resource => {
                                tableRef.value.toggleRowSelection(resource, true);
                            })
                        }
                    })

                    loading.value = false;
                });
            }
        }

        const onSelectionChange = (rows) => {
            emit('selectionChange', rows);
        }

        const initPagination = () => {
            currentPage.value = props.current_page
            pageSize.value = props.page_size
        }

        onMounted(() => {
            getResourceList();
        })

        expose({getResourceList, initPagination})

        watch(() => props.data, () => {
            getResourceList()
        })

        return () => (
            <>
                {props.customTable ? props.customTable(resources.value) :
                    <el-table data={resources.value} ref={tableRef}
                              onSelectionChange={onSelectionChange}
                              headerCellStyle={{textAlign: 'center'}}
                              cellStyle={{textAlign: 'center'}}
                              rowKey="id"
                              {...props.tableProps}
                    >
                        {{
                            default: () => <>
                                {props.enableSelection && <el-table-column type="selection" width="55"/>}
                                {props.columns.map(column => (
                                    column.type === 'expand' ?
                                        <el-table-column type="expand">
                                            {{
                                                default: (scope) => renderItem(column, scope)
                                            }}
                                        </el-table-column> :
                                        <el-table-column width={column.width}>
                                            {{
                                                header: () => <el-text>{column.label}</el-text>,
                                                default: (scope) => renderItem(column, scope)
                                            }}
                                        </el-table-column>
                                ))}
                            </>,
                            empty: () => <el-empty/>
                        }}
                    </el-table>}

                {
                    <div class="column-align-center">
                        <el-divider></el-divider>
                        <el-pagination v-model:pageSize={pageSize.value}
                                       v-model:currentPage={currentPage.value}
                                       pageSizes={[10, 50, 100]}
                                       total={resourcesTotal.value}
                                       layout="total,sizes, prev, pager, next, jumper"
                                       onSizeChange={() => getResourceList()}
                                       onCurrentChange={() => getResourceList()}
                        />
                    </div>
                }
            </>
        )
    }
})