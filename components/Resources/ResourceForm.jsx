import {defineComponent, onMounted, ref, toRaw, markRaw, watch, nextTick, inject} from "vue";
import {Delete, Plus, Rank, WarnTriangleFilled} from "@element-plus/icons-vue";
import ElTableNext from "el-table-next";
import {ElMessageBox} from "element-plus";
import Sortable from 'sortablejs';

import API from "@/api";
import './ResourceForm.scss';

import _ from "lodash-es";

import {useI18n} from 'vue-i18n'

const renderOption = (c, r) => (
    <el-select modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)} class="w-100" {...c.props}
               filterable remoteMethod={(q) => {
        if (!c.props.remote) return;
        c.props.loading = true;
        c.remoteMethod(q).then(response => {
            if (!q) {
                c.options = [];
            } else {
                c.options = response.data.map(i => ({
                    label: i[c.remote_options.label],
                    value: i[c.remote_options.value]
                }));
                c.props.loading = false;
            }
        })
    }}>
        {c.options && c.options.map(option => (
            <el-option key={option.value} label={option.label} value={option.value}/>))}
    </el-select>)

const renderRadioGroup = (c, r) => (
    <el-radio-group modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)} {...c.props}>
        {c.options && c.options.map(option => (
            <el-radio label={option.value}>{option.label}</el-radio>))}
    </el-radio-group>
)

const renderRemoteCascader = (c, r) => (
    <el-cascader class="w-100"
                 modelValue={_.get(r, c.prop)}
                 onChange={(e) => {
                     //合并选项，并去重
                     let arr = []
                     e.forEach(i => {
                         arr = _.concat(arr, i)
                     })
                     arr = _.uniq(arr)
                     _.set(r, c.prop, arr);
                 }}
                 {...c.props}
                 props={c.props.props}
                 options={c.options}
    ></el-cascader>
)

const renderImage = (c, r) => {
    return (<>
        <el-upload
            class="resource-form-image"
            show-file-list={false}
            http-request={({file}) => {
                API.Storage.upload(file).then(response => {
                    _.set(r, c.prop, response.data.id);
                    _.set(r, c.prop.replace('_id', ''), response.data);
                });
            }}
        >
            {_.get(r, c.prop.replace('_id', '')) ? <div class='uploader-image'>
                <el-image src={_.get(r, c.prop.replace('_id', ''))['src']}/>
            </div> : <el-icon class='uploader-icon'><Plus/></el-icon>}
        </el-upload>
    </>)
}

const renderFile = (c, r) => {
    return (<el-upload
        class="resource-form-file"
        show-file-list={false}
        http-request={({file}) => {
            API.Storage.upload(file).then(response => {
                _.set(r, c.prop, response.data.id);
                _.set(r, c.prop.replace('_id', ''), response.data);
            });
        }}
    >
        {_.get(r, c.prop.replace('_id', '')) ?
            <el-text>{_.get(r, c.prop.replace('_id', ''))['filename']}</el-text>
            : <el-icon class='uploader-icon'><Plus/></el-icon>}
    </el-upload>)
}


const renderDragImages = (c, r) => {
    return (
        <div id={c.prop + "_drag_images"} class={"resource-form-drag-image flex-warp"} data-prop={c.prop}>
            {_.get(r, c.prop).filter(i => !('_destroy' in i) || i['_destroy'] !== true).map(item => (
                <div class="resource-form-drag-image-item" style={c.props.style}>
                    <el-image src={item.image.src} fit="fill"></el-image>
                    <div class="resource-form-drag-image-item-mask">
                        <el-icon class={"flex-1 icon-drag"}>
                            <Rank/>
                        </el-icon>
                        <div className={'line'}></div>
                        <div class={"flex-1 h-100 icon-del row-center"} onClick={
                            () => {
                                ElMessageBox.confirm('确定删除该图片吗？', '提示', {
                                    confirmButtonText: '确定',
                                    cancelButtonText: '取消',
                                    type: 'warning'
                                }).then(() => {
                                    //为当前数据添加删除标记
                                    _.set(item, '_destroy', true)
                                }).catch(() => {
                                });
                            }
                        }>
                            <el-icon><Delete/></el-icon>
                        </div>
                    </div>
                </div>
            ))}

            <el-upload style={c.props.style}
                       class="resource-form-image resource-form-drag-image-upload"
                       show-file-list={false}
                       http-request={({file}) => {
                           API.Storage.upload(file).then(response => {
                               _.get(r, c.prop).push({
                                   index: _.get(r, c.prop).length + 1,
                                   image_id: response.data.id,
                                   image: response.data
                               })
                           });
                       }}
                       multiple>
                <el-icon class='uploader-icon'><Plus/></el-icon>
            </el-upload>
        </div>
        // </el-form-item>
        // </el-col>
    )
}

const renderColumn = {
    'text': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                type="text" {...c.props} />,

    'textarea': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                    type="textarea" {...c.props}/>,

    'password': (c, r) => <el-input modelValue={_.get(r, c.prop)} onInput={(e) => _.set(r, c.prop, e)}
                                    type="password" {...c.props} show-password/>,

    'number': (c, r) => <el-input-number modelValue={_.get(r, c.prop)} onChange={(e) => _.set(r, c.prop, e)}
                                         {...c.props} />,

    'date': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                      type="date" {...c.props}/>,

    'datetime': (c, r) => <el-date-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => _.set(r, c.prop, e)}
                                          type="datetime" {...c.props}/>,

    'time': (c, r) => <el-time-picker modelValue={_.get(r, c.prop)} onUpdate:modelValue={(e) => {
        _.set(r, c.prop, e)
    }}
                                      arrow-control {...c.props}/>,
    'options': renderOption,
    'remote_options': renderOption,
    'image': renderImage,
    'file': renderFile,
    'display': (c, r) => c.render ? c.render(c, r) : <el-text class="mx-6">{_.get(r, c.prop)}</el-text>,
    'color': (c, r) => <el-color-picker modelValue={_.get(r, c.prop)}
                                        onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-color-picker>,
    'slider': (c, r) => <el-slider modelValue={_.get(r, c.prop)}
                                   onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-slider>,
    'switch': (c, r) => <el-switch modelValue={_.get(r, c.prop)}
                                   onUpdate:modelValue={(e) => _.set(r, c.prop, e)} {...c.props}></el-switch>,
    'radio_group': renderRadioGroup,

    'remote_cascader': renderRemoteCascader,

    'drag_images': renderDragImages,
}

const setColumnDefault = (c, r) => {
    _.set(r, c.prop, c.default || typeof c.default === 'boolean' ? c.default : initResource[c.type](c))
}

const renderDragAssociations = (t, column, resource) => {
    return (
        <el-col span={24}>
            <div id={column.prop + "_drag_associations"} class={"resource-drag-associations"}
                 data-prop={column.prop}>
                {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 0 ? _.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).map((item, index) => (
                    <div class={'d-flex align-center resource-drag-associations-item'}>
                        {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 1 &&
                            <el-icon size={16} class={"drag_handle icon-drag mr-20"}>
                                <Rank/>
                            </el-icon>}
                        {column.columns.filter(c => c.type === 'image').map(c => (
                            (!c.condition || c.condition(resource)) &&
                            <el-form-item class={"mr-20"} prop={[column.prop, index, c.prop]}>
                                {column.prop + index + c.prop}
                                <div className={""}>{c.label}</div>
                                {renderColumn[c.type](c, item)}
                            </el-form-item>
                        ))}
                        <el-row gutter={20}>
                            {column.columns.filter(c => c.type != 'image' && c.type != 'hidden').map(c => (!c.condition || c.condition(resource)) && (
                                <el-col span={c.span ? c.span : 18}>
                                    <el-form-item rules={c.rules} prop={[column.prop, index, c.prop]}>
                                        <div className={""}>{c.label}</div>
                                        {renderColumn[c.type](c, item)}
                                    </el-form-item>
                                </el-col>
                            ))}
                        </el-row>
                        <el-button circle class={'ml-20'} plain icon={Delete} type="danger" onClick={() => {
                            ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                                _.set(item, '_destroy', true)
                            })
                        }}/>
                    </div>
                )) : <div class={"row-center"} style="height:80px;">{t('resources.no_data')}</div>
                }
            </div>
            {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length < column.props.max(resource) &&
                <div className="text-start my-10">
                    <el-button plain icon={Plus} type="primary" onClick={() => {
                        let newResource = {};
                        column.columns.forEach(c => setColumnDefault(c, newResource))
                        _.get(resource, column.prop).push(newResource);
                    }}>{t('resources.add')}
                    </el-button>
                </div>}
        </el-col>
    )
}

const renderAssociations = (t, column, resource) => (<el-col span={24}>
    <ElTableNext
        data={_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] !== true)}
        column={[...[{

            label: t('resources.actions'),
            render: (value, scope) => <el-button icon={Delete} circle plain type='danger' onClick={() => {
                ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
                    _.get(resource, column.prop)[value.$index]['_destroy'] = true
                })
            }}/>
        }], ...column.columns.map(c => ({
            prop: c.prop,
            label: c.label, ...c.props,
            render: (value, scope) => renderColumn[c.type](c, scope.row)
        }))]

        } border/>
    <div class="text-start my-10">
        <el-button plain icon={Plus} type="primary" onClick={() => {
            let newResource = {};
            column.columns.forEach(c => setColumnDefault(c, newResource))
            _.get(resource, column.prop).push(newResource);
        }}>{t('resources.add')}
        </el-button>
    </div>
</el-col>)

const renderAssociation = (t, column, resource) => renderColumns(t, column.columns, _.get(resource, column.prop))

const renderColumns = (t, columns, resource) => columns.map((column) => {
    if (!column.condition || column.condition(resource)) {
        if (column.type === 'associations')
            return (renderAssociations(t, column, resource))
        else if (column.type === 'association')
            return (renderAssociation(t, column, resource))
        else if (column.type === 'drag_associations')
            return (renderDragAssociations(t, column, resource))
        else if (column.type === 'hidden')
            return null
        else return (
                <el-col span={column.span ? column.span : 18}>
                    <el-form-item label={column.label} prop={column.prop.split(',')}>
                        {renderColumn[column.type](column, resource)}
                        {column.type != 'display' && column.render && column.render(resource)}
                    </el-form-item>
                </el-col>)
    }
})

const initResource = {
    'text': (c) => null,
    'textarea': (c) => null,
    'password': (c) => null,
    'number': (c) => null,
    'date': (c) => null,
    'datetime': (c) => null,
    'time': (c) => null,
    'options': (c) => c && c.props && c.props.multiple ? [] : null,
    'remote_options': (c) => c && c.props && c.props.multiple ? [] : null,
    'remote_cascader': (c) => c && c.props && c.props.multiple ? [] : null,
    'image': (c) => null,
    'file': (c) => null,
    'display': (c) => null,
    'association': (c) => ({}),
    'associations': (c) => [],
    'hidden': (c) => null,
    'color': (c) => null,
    'slider': (c) => null,
    'switch': (c) => null,
    'radio_group': (c) => null,

    'drag_images': (c) => [],
    'drag_associations': (c) => [],
}

const filterRules = (columns) => columns
    .filter(c => c.rules || c.columns)
    .map(c => c.columns ? ({[c.prop]: {fields: filterRules(c.columns)}}) : ({[c.prop]: c.rules}))
    .reduce((t, c) => Object.assign(t, c), ({}))

export default defineComponent({
    name: 'ResourceForm', props: {
        resource: Object, columns: Array, tabs: Array, LabelPosition: {
            type: String,
            default: 'right'
        },
    }, emits: ['submit', 'change'], setup(props, {expose, emit}) {
        const {t} = useI18n()

        const fullscreen = inject('_fullscreen', false)

        const formRef = ref(null);
        const activeTab = ref(0);
        const Tabs = ref(props.tabs ? props.tabs : []);

        const columns = ref(props.columns.filter(column => !column.disable));
        const resource = ref(props.resource ? props.resource : {});

        const rules = ref([]);

        const initSortable = ref({});

        const initColumn = (column) => {
            if (!column.type) column.type = 'text';

            if (!column.props) column.props = {}

            // Init Default Value
            if (!props.resource) setColumnDefault(column, resource.value);

            if (column.type === 'remote_options') {
                column.options = []
                column.props.loading = true
                if (column.props.remote) {
                    column.props.loading = false
                } else {
                    column.remote_options.remote().then(data => {
                        column.options = data.map(d => ({
                            value: d[column.remote_options.value], label: d[column.remote_options.label]
                        }))
                        column.props.loading = false
                    })
                }
            } else if (column.type === 'remote_cascader') {
                column.options = []
                column.props.loading = true

                column.remote_cascader_option.remote().then(data => {
                    column.options = data.map(d => ({
                        value: d[column.remote_cascader_option.value],
                        label: d[column.remote_cascader_option.label],
                        child_ids: d.child_ids,
                        ancestry: d.ancestry
                    }))
                    column.options.forEach(i => {
                        if (i.child_ids.length > 0) {
                            i.children = toRaw(column.options.filter(j => i.child_ids.includes(j.value)))
                        }
                    })
                    column.options = column.options.filter(i => !i.ancestry || i.ancestry == null)
                    column.props.loading = false
                })
            } else if (column.type === 'associations') {
                column.columns.forEach(c => initColumn(c));
            } else if (column.type === 'association') {
                column.columns.forEach(c => initColumn(c));
            } else if (column.type === 'drag_images') {
                _.set(resource.value, column.prop, _.orderBy(toRaw(_.get(resource.value, column.prop)), ['index'], ['asc']))
            } else if (column.type === 'drag_associations') {
                _.set(resource.value, column.prop, _.orderBy(toRaw(_.get(resource.value, column.prop)), ['index'], ['asc']))
                column.columns.forEach(c => initColumn(c));
            }
        }

        columns.value.filter(column => column.type === 'drag_images' || column.type === 'drag_associations').map(i => {
            _.set(initSortable.value, i.prop, false)
        })

        const prepareColumn = (cs, r) => {
            let result = {};

            if (r.id) result.id = r.id

            if ('_destroy' in r) result['_destroy'] = r['_destroy']

            cs.forEach(c => {
                if (!c.condition || c.condition(r)) {
                    if (c.type === 'associations') {
                        result[`${c.prop}_attributes`] = _.get(r, c.prop).map(d => prepareColumn(c.columns, d))
                    } else if (c.type === 'association') {
                        result[`${c.prop}_attributes`] = prepareColumn(c.columns, _.get(r, c.prop))
                    } else if (c.type === 'drag_images') {
                        result[`${c.prop}_attributes`] = _.get(r, c.prop).map(d => prepareColumn(c.columns, d))
                    } else if (c.type === 'drag_associations') {
                        result[`${c.prop}_attributes`] = _.get(r, c.prop).map(d => prepareColumn(c.columns, d))
                    } else if (c.type !== 'display') {
                        result[c.prop] = _.get(r, c.prop)
                    }
                } else {

                }
            })
            return result
        }

        const submit = () => {
            // 归属某个tab下的验证，tab出现错误标识
            formRef.value.validate((valid, msg) => {
                console.log(msg);

                if (valid) {
                    emit('submit', prepareColumn(columns.value, resource.value));
                } else {
                    let errors = []
                    _.keys(msg).forEach(key => {
                        let val = key.split('.')[0]
                        Tabs.value.forEach((tab, index) => {
                            if (_.includes(tab.prop, val) && !_.includes(errors, tab.name)) {
                                errors.push(tab.name)
                                _.set(tab, 'is_error', true)
                            }
                        })
                    })
                    Tabs.value.filter(tab => !_.includes(errors, tab.name)).forEach(tab => {
                        _.set(tab, 'is_error', false)
                    })
                }
            });
        }

        const setInitSortable = (async () => {
            await nextTick()
            columns.value.filter(column => column.type === 'drag_images' || column.type === 'drag_associations').forEach(i => {
                if (i.type === 'drag_images') {
                    let el = document.getElementById(`${i.prop}_drag_images`)
                    if (el && !_.get(initSortable.value, i.prop)) {
                        CreateSortable(el, {
                            handle: '.icon-drag',
                            filter: '.resource-form-drag-image-upload',
                        })
                        _.set(initSortable.value, i.prop, true)
                    }
                } else if (i.type === 'drag_associations') {
                    let el = document.getElementById(`${i.prop}_drag_associations`)
                    if (el && !_.get(initSortable.value, i.prop)) {
                        CreateSortable(el, {
                            handle: '.icon-drag',
                        })
                        _.set(initSortable.value, i.prop, true)
                    }
                }
            })
        })

        const CreateSortable = async (el, prop) => {
            Sortable.create(el, {
                ...prop,
                store: {
                    get: function (sortable) {
                        // console.log(sortable)
                    },
                    set: function (sortable) {
                        // console.log(sortable)
                    }
                },
                onChange: function (evt) {
                    // console.log(evt)
                },
                onEnd: function (evt) {
                    let el_prop = evt.target.dataset.prop
                    let n_path = `${el_prop}[${evt.newIndex}]`
                    let o_path = `${el_prop}[${evt.oldIndex}]`
                    _.set(_.get(resource.value, n_path), 'index', evt.oldIndex)
                    _.set(_.get(resource.value, o_path), 'index', evt.newIndex)
                }
            });
        }

        watch(resource, (newResource) => {
            // console.log(newResource)
            setInitSortable()
            emit('change', newResource)
        }, {deep: true})


        onMounted(() => {
            setInitSortable()
            rules.value = filterRules(columns.value)

            console.log(rules.value)
        })

        expose({submit})

        columns.value.forEach((column) => initColumn(column));

        // columns.value
        //     .filter(column => column.rules)
        //     .forEach(column => rules.value[column.prop] = column.rules)

        props.tabs && Tabs.value.forEach(tab => {
            _.set(tab, 'is_error', false)
        })

        return () => (
            <el-form rules={rules} ref={formRef} model={resource.value} label-width='auto'
                     label-position={props.LabelPosition}>
                {props.tabs ? <el-tabs v-model={activeTab.value} class="resource-form-tabs">
                    {props.tabs.map((tab, index) => <el-tab-pane name={index}>
                        {{
                            label: () => (<div class={["row-center", Tabs.value[index].is_error ? 'is_error' : '']}>
                                <span>{tab.name}</span>
                                {Tabs.value[index].is_error && <el-icon><WarnTriangleFilled/></el-icon>}
                            </div>),

                            default: () => <el-scrollbar
                                wrap-class={!fullscreen.value ? 'form-el-scrollbar-wrap-class' : ''}>
                                <el-row gutter={20}>
                                    {renderColumns(t, columns.value.filter(column => tab.prop.includes(column.prop)), resource.value)}
                                </el-row>
                            </el-scrollbar>
                        }}
                    </el-tab-pane>)}
                </el-tabs> : <el-row gutter={20}>
                    {renderColumns(t, columns.value, resource.value)}
                </el-row>}
            </el-form>
        )
    }
})