import {ref, defineComponent, reactive, toRaw, onMounted} from "vue";
import API from "@/api";
import {ElMessage, ElMessageBox} from "element-plus";
import ElTableNext from "el-table-next";

import {Delete, Edit, ZoomIn, Search, Refresh, Plus} from "@element-plus/icons-vue";
import {formatDateTime} from "../../config/tools";

import _ from 'lodash-es';

import {useI18n} from 'vue-i18n'

const renderOption = (c, r) => (
    <el-select modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)} class="w-100" {...c.props}
               filterable>
        {c.options && c.options.map(option => (
            <el-option key={option.value} label={option.label} value={option.value}/>))}
    </el-select>)

const renderRemoteOption = (c, r) => {
    c.options = []
    c.remote_options.remote().then(data => {
        c.options = data.map(d => ({
            value: d[c.remote_options.value], label: d[c.remote_options.label]
        }))
    })
    return renderOption(c, r)
}

const renderColumn = {
    'text': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                type="text" {...c.props} />,

    'date': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                      type="date" {...c.props}/>,

    'datetime': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                          type="datetime" {...c.props}/>,

    'time': (c, r) => <el-time-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => {
        _.set(r, c.prop, e)
    }}
                                      arrow-control {...c.props}/>,
    'options': renderOption,
    'remote_options': renderRemoteOption,
}

const renderFilters = (queries, filters) => filters.map(filter => (
    <el-col span={6}>
        <el-form-item label={filter.label} prop={filter.prop}>
            {renderColumn[filter.type ? filter.type : 'text'](filter, queries)}
        </el-form-item>
    </el-col>
))

const setColumnDefault = (c, r) => {
    _.set(r, c.prop, c.default)
}

export default defineComponent({
    name: 'ResourceIndex',
    props: {
        resourceConfig: Object,
        listConfig: Object
    },
    emits: ['new', 'show', 'edit'],
    setup(props, {expose, emit}) {
        const {t} = useI18n()

        const queryFormRef = ref(null);

        const displayFilter = ref(false);
        const loadingList = ref(true);

        const listResources = ref([]);
        const listResourcesTotal = ref(0);
        const selectedIds = ref([]);
        const fullListColumns = ref([]);

        const queries = reactive({
            query_title: '',
            page: 1,
            page_size: 10
        });

        const filterColumns = ref(props.listConfig.filters.filter(column => !column.disable));

        filterColumns.value.forEach((column) => setColumnDefault(column, queries));

        const onDelete = (resource) => {
            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                loadingList.value = true;
                API[props.resourceConfig.resourceData].delete(resource.id).then(response => {
                    getResourceList();
                    ElMessage({
                        message: t('resources.delete_message'),
                        type: 'success',
                    })
                })
            }).catch(() => {
                // catch error
            })
        }

        const getResourceList = () => {
            loadingList.value = true;
            API[props.resourceConfig.resourceData].all(toRaw(queries)).then(response => {
                listResources.value = response.data;
                listResourcesTotal.value = response.total;
                loadingList.value = false;
            });
        }

        const onResetQuery = () => {
            queryFormRef.value.resetFields();
            getResourceList();
        }

        const onSearch = () => {
            displayFilter.value = !displayFilter.value;
        }

        const handleSelectionChange = (rows) => {
            selectedIds.value = rows.map(row => row.id)
        }

        const onDeleteSelected = () => {

        }

        fullListColumns.value = [...[{
            type: "selection",
            width: "55px",
            label: '选择'
        }], ...props.listConfig.columns.map(column => {
            if (column.type === 'datetime')
                column.render = (value, scope) => (
                    formatDateTime(_.get(scope.row, column.prop))
                );
            else if (column.type === 'image')
                column.render = (value, scope) => (
                    _.get(scope.row, column.prop) && <img height={70} src={_.get(scope.row, column.prop).src}/>
                )
            return column
        }), ...[{
            label: t('resources.actions'),
            fixed: 'right',
            width: 150,
            render: (scope) => (
                <div>
                    <el-button plain type="primary" icon={ZoomIn} circle
                               onClick={() => emit('show', scope.row)}/>

                    <el-button plain type="warning" icon={Edit} circle
                               onClick={() => emit('edit', scope.row)}/>

                    <el-button plain type="danger" icon={Delete} circle
                               onClick={() => onDelete(scope.row)}/>
                </div>
            )
        }]]

        onMounted(() => {
            getResourceList();
        })

        expose({getResourceList})

        return () => (
            <el-card shadow="never">

                <div className="mt-10" v-show={displayFilter.value}>
                    <el-form ref={queryFormRef} model={queries} label-position="left" label-width="auto">
                        <el-row gutter={20}>

                            {renderFilters(queries, filterColumns.value)}

                            <el-col span={6} class="text-center">
                                <el-button type="primary" onClick={() => getResourceList()} icon={Search}>
                                    {t('resources.search')}
                                </el-button>
                                <el-button onClick={onResetQuery} icon={Refresh}>{t('resources.reset')}</el-button>
                            </el-col>
                        </el-row>
                    </el-form>

                    <el-divider/>
                </div>

                <div className="row-justify-space-between">
                    <h3 className="my-0">{props.listConfig.title}</h3>
                    <div>
                        <el-button icon={Refresh} circle onClick={() => getResourceList()}/>
                        <el-button icon={Search} circle type={displayFilter.value ? 'primary' : 'default'}
                                   onClick={onSearch}/>

                        <el-button icon={Plus} type="primary" onClick={() => {
                            emit('new')
                        }}>{t('resources.new')}
                        </el-button>

                        <el-button icon={Delete} plain type="danger" v-show={selectedIds.value.length}
                                   onClick={onDeleteSelected}>{t('resources.delete')}
                        </el-button>
                    </div>
                </div>

                <el-divider/>

                <ElTableNext v-loading={loadingList.value}
                             column={fullListColumns.value}
                             data={listResources.value}
                             onSelectionChange={handleSelectionChange} stripe/>

                <div className={"row-justify-space-between"} style={{height: '50px', alignItems: 'flex-end'}}>
                    <el-pagination v-model:pageSize={queries.page_size}
                                   pageSizes={[10, 50, 100]}
                                   total={listResourcesTotal.value}
                                   layout="sizes, total"
                                   onSizeChange={() => getResourceList()}
                    />
                    <el-pagination
                        v-model:current-page={queries.page}
                        v-model:pageSize={queries.page_size}
                        total={listResourcesTotal.value}
                        layout="prev, pager, next, jumper"
                        onCurrentChange={() => getResourceList()}
                        background
                    />
                </div>

            </el-card>
        )
    }
})