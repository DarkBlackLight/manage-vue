import {ref, defineComponent, onMounted, nextTick} from "vue";
import {formatDateTime} from "../../config/tools";

import _ from 'lodash-es';

const renderItem = (column, scope) => {
    let p = [column.prop];
    let r = scope.row
    if (column.type === 'image') {
        return (
            <img height={60} src={_.get(r, p).src}/>
        )
    } else if (column.type === 'datetime') {
        return <el-text>{formatDateTime(_.get(r, p))}</el-text>
    } else {
        return (<el-text>{_.get(r, p)}</el-text>)
    }
}

export default defineComponent({
    name: 'ResourceTable',
    props: {
        columns: {
            type: Array,
            required: true
        },
        remote: {
            type: Function,
            required: true
        },
        preprocess: {
            type: Function
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
        }
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
            loading.value = true;
            props.remote().then(async response => {

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

        const onSelectionChange = (rows) => {
            emit('selectionChange', rows);
        }

        onMounted(() => {
            getResourceList();
        })

        expose({getResourceList})

        return () => (
            <>
                <el-table data={resources.value} ref={tableRef}
                          onSelectionChange={onSelectionChange}
                >
                    <el-table-column type="selection" width="55"/>

                    {props.columns.map(column => (
                        <el-table-column width={column.width}>
                            {{
                                header: () => <el-text>{column.label}</el-text>,
                                default: (scope) => renderItem(column, scope)
                            }}
                        </el-table-column>
                    ))}
                </el-table>

                <el-divider></el-divider>

                <el-pagination v-model:pageSize={pageSize.value}
                               v-model:currentPage={currentPage.value}
                               pageSizes={[1, 10, 50, 100]}
                               total={resourcesTotal.value}
                               layout="total,sizes, prev, pager, next, jumper"
                               onSizeChange={() => getResourceList()}
                               onCurrentChange={() => getResourceList()}
                />
            </>
        )
    }
})