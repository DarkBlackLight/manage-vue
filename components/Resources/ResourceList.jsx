import {ref, defineComponent, reactive, toRaw, onMounted} from "vue";
import API from "@/api";
import {ElMessage, ElMessageBox} from "element-plus";
import ElTableNext from "el-table-next";

import './ResourceList.scss';

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
    }} arrow-control {...c.props}/>,
    'options': renderOption,
    'remote_options': renderRemoteOption,
}

const renderFilters = (queries, filters) => filters.map(filter => {
    if (filter.type === 'form_to') {
        return (
            filter.options.map(option => (
                <el-col span={filter.span ? filter.span : 6}>
                    <div class={"d-flex"}>
                        <span class={"el-form-item__label"}>{option.label}</span>
                        <el-form-item class={"flex-1"} label={''} prop={option.prop}>
                            {renderColumn[option.type ? option.type : 'text'](option, queries)}
                        </el-form-item>
                    </div>
                </el-col>
            ))
        )
    } else {
        return (<el-col span={filter.span ? filter.span : 6}>
            <el-form-item label={filter.label} prop={filter.prop}>
                {renderColumn[filter.type ? filter.type : 'text'](filter, queries)}
            </el-form-item>
        </el-col>)
    }
})

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
        const tableRef = ref(null);

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

        if (props.listConfig.tabs) {
            Object.assign(queries, {
                [props.listConfig.tabs.prop]: props.listConfig.tabs.props
            })
        }

        if (props.listConfig.query) {
            _.assign(queries, props.listConfig.query)
        }

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
            API[props.resourceConfig.resourceData].all(toRaw(queries)).then(async response => {

                if (props.listConfig.preprocess) {
                    response = await props.listConfig.preprocess(response);
                }

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

        const onTabChange = () => {
            getResourceList()
        }

        fullListColumns.value = [
            ...props.listConfig.columns.map(column => {
                if (column.type === 'datetime')
                    column.render = (value, scope) => (
                        formatDateTime(_.get(scope.row, column.prop))
                    );
                else if (column.type === 'image')
                    column.render = (value, scope) => (
                        _.get(scope.row, column.prop) &&
                        <img height={column.props && column.props.height ? column.props.height(scope) : 70}
                             src={_.get(scope.row, column.prop).src}/>
                    )
                return column
            }), ...[{
                label: t('resources.actions'),
                fixed: 'right',
                width: 150,
                render: (scope) => (
                    (scope.row[props.listConfig.tree] || !props.listConfig.tree) && <div>
                        {props.listConfig.actions.includes('show') &&
                            <el-button plain type="primary" icon={ZoomIn} circle
                                       onClick={() => emit('show', scope.row)}/>}

                        {props.listConfig.actions.includes('edit') &&
                            <el-button plain type="warning" icon={Edit} circle
                                       onClick={() => emit('edit', scope.row)}/>}

                        {props.listConfig.actions.includes('delete') &&
                            <el-button plain type="danger" icon={Delete} circle
                                       onClick={() => onDelete(scope.row)}/>}
                    </div>
                )
            }]]

        if (props.listConfig && props.listConfig.actions && (!props.listConfig.actions.includes('show') &&
            !props.listConfig.actions.includes('edit') &&
            !props.listConfig.actions.includes('delete'))
        ) {
            fullListColumns.value.pop()
        }


        onMounted(() => {
            getResourceList();
        })

        expose({getResourceList, tableRef})

        return () => (
            <>
                <el-main>
                    {
                        props.listConfig.header ? props.listConfig.header() : null
                    }
                    {
                        props.listConfig.tabs && props.listConfig.tabs.options && props.listConfig.tabs.options.length > 0 &&
                        <el-tabs className="resource-list-tabs" v-model={queries[props.listConfig.tabs.prop]}
                                 onTabChange={onTabChange}>
                            {
                                props.listConfig.tabs.options.map(tab => (
                                    <el-tab-pane label={tab.label} name={tab.value}></el-tab-pane>
                                ))
                            }
                        </el-tabs>
                    }

                    <div className="" v-show={displayFilter.value}>
                        <el-form ref={queryFormRef} model={queries} label-position="left" label-width="auto">
                            <div class="d-flex align-center justify-between">
                                <div class={'flex-1'}>
                                    <el-row gutter={20}>
                                        {renderFilters(queries, props.listConfig.filters)}
                                        {/*<el-col span={6} class="text-center">*/}
                                        {/*</el-col>*/}
                                    </el-row>
                                </div>
                                <div class={"d-flex align-center"} style={"margin:0 0 18px 50px;"}>
                                    <el-button type="primary" onClick={() => getResourceList()} icon={Search}>
                                        {t('resources.search')}
                                    </el-button>
                                    <el-button onClick={onResetQuery} icon={Refresh}>{t('resources.reset')}</el-button>
                                </div>
                            </div>
                        </el-form>

                        <el-divider/>
                    </div>

                    <div className="row-justify-space-between mb-10">
                        <h3 className="list-title">{props.listConfig.title}</h3>
                        <div>
                            <el-button icon={Refresh} circle onClick={() => getResourceList()}/>

                            {props.listConfig.filters.length > 0 &&
                                <el-button icon={Search} circle type={displayFilter.value ? 'primary' : 'default'}
                                           onClick={onSearch}/>}

                            {(!props.listConfig.actions || props.listConfig.actions.includes('new')) &&
                                <el-button icon={Plus} type="primary" onClick={() => {
                                    emit('new')
                                }}>{t('resources.new')}
                                </el-button>}

                            {(!props.listConfig.actions || props.listConfig.actions.includes('delete')) &&
                                <el-button icon={Delete} plain type="danger" v-show={selectedIds.value.length}
                                           onClick={onDeleteSelected}>{t('resources.delete')}
                                </el-button>}
                        </div>
                    </div>

                    <ElTableNext
                        v-loading={loadingList.value}
                        column={fullListColumns.value}
                        data={listResources.value}
                        header-cell-class-name="table-header-cell-custom"
                        header-cell-style={{background: '#ECECFD'}}
                        onSelectionChange={handleSelectionChange}
                        stripe
                        ref={tableRef}
                        {
                            ...props.listConfig.tableProps
                        }
                    />
                </el-main>
                <el-footer class={"el-footer-custom"}>
                    <div className={"row-justify-space-between"} style={{height: '100%', alignItems: 'center'}}>
                        <div className={"footer-choice"}>
                            已选择<span className={"mx-6"}>{selectedIds.value.length}</span>项
                        </div>

                        <div className="row-align-center">
                            <el-pagination class={"el-pagination-custom"}
                                           v-model:pageSize={queries.page_size}
                                           v-model:currentPage={queries.page}
                                           pageSizes={[1, 10, 50, 100]}
                                           total={listResourcesTotal.value}
                                           layout="total,sizes, prev, pager, next, jumper"
                                           onSizeChange={() => getResourceList()}
                                           onCurrentChange={() => getResourceList()}
                            />
                        </div>
                    </div>
                </el-footer>
            </>
        )
    }
})