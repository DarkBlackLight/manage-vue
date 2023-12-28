import _ from "lodash-es";
import API from "@/api";
import {Delete, Plus, Rank} from "@element-plus/icons-vue";
import {ElMessageBox} from "element-plus";
import {defineComponent, onMounted, ref, nextTick} from "vue";
import Sortable from 'sortablejs';

// const renderDragAssociations = (t, column, resource) => {
//     return (
//         <el-col span={24}>
//             <div id={column.prop + "_drag_associations"} class={"resource-drag-associations"}
//                  data-prop={column.prop}>
//                 {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 0 ? _.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).map((item, index) => (
//                     <div class={'d-flex align-center resource-drag-associations-item'}>
//                         {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length > 1 &&
//                             <el-icon size={16} class={"drag_handle icon-drag mr-20"}>
//                                 <Rank/>
//                             </el-icon>}
//                         {column.columns.filter(c => c.type === 'image').map(c => (
//                             (!c.condition || c.condition(resource)) &&
//                             <el-form-item class={"mr-20"} prop={[column.prop, index, c.prop]}>
//                                 {column.prop + index + c.prop}
//                                 <div class={""}>{c.label}</div>
//                                 {renderColumn[c.type](c, item)}
//                             </el-form-item>
//                         ))}
//                         <el-row gutter={20}>
//                             {column.columns.filter(c => c.type != 'image' && c.type != 'hidden').map(c => (!c.condition || c.condition(resource)) && (
//                                 <el-col span={c.span ? c.span : 18}>
//                                     <el-form-item rules={c.rules} prop={[column.prop, index, c.prop]}>
//                                         <div class={""}>{c.label}</div>
//                                         {renderColumn[c.type](c, item)}
//                                     </el-form-item>
//                                 </el-col>
//                             ))}
//                         </el-row>
//                         <el-button circle class={'ml-20'} plain icon={Delete} type="danger" onClick={() => {
//                             ElMessageBox.confirm(t('resources.delete_prompt')).then(() => {
//                                 _.set(item, '_destroy', true)
//                             })
//                         }}/>
//                     </div>
//                 )) : <div class={"row-center"} style="height:80px;">{t('resources.no_data')}</div>
//                 }
//             </div>
//             {_.get(resource, column.prop).filter(r => !('_destroy' in r) || r['_destroy'] != true).length < column.props.max(resource) &&
//                 <div class="text-start my-10">
//                     <el-button plain icon={Plus} type="primary" onClick={() => {
//                         let newResource = {};
//                         column.columns.forEach(c => setColumnDefault(c, newResource))
//                         _.get(resource, column.prop).push(newResource);
//                     }}>{t('resources.add')}
//                     </el-button>
//                 </div>}
//         </el-col>
//     )
// }

//
// const renderColumns = (t, columns, resource) => columns.map((column) => {
//     if (!column.condition || column.condition(resource)) {
//         if (column.type === 'associations')
//             return (renderAssociations(t, column, resource))
//         else if (column.type === 'association')
//             return (renderAssociation(t, column, resource))
//         else if (column.type === 'drag_associations')
//             return (renderDragAssociations(t, column, resource))
//         else if (column.type === 'hidden')
//             return null
//         else return (
//                 <el-col span={column.span ? column.span : 18}>
//                     <el-form-item label={column.label} prop={column.prop.split(',')}>
//                         {renderColumn[column.type](column, resource)}
//                         {column.type != 'display' && column.render && column.render(resource)}
//                     </el-form-item>
//                 </el-col>)
//     }
// })

const fetchRemoteOptions = (props, states, q) => {
    if (props.remote_options.remote) {
        states.loading = true;
        props.remote_options.remote(q, props.path, props.resource).then(response => {
            states.options = response.map(i => ({
                label: _.get(i, props.remote_options.label),
                value: _.get(i, props.remote_options.value)
            }));

            states.loading = false;
        })
    }
}

const fetchRemoteCascader = (props, states) => {
    const filterOptions = (parent_id, options) => options.filter(o => o.parent_id === parent_id)
        .map(o => ({...o, ...{children: filterOptions(o.id, options)}}))

    if (props.remote_cascader_options.remote) {
        props.remote_cascader_options.remote().then(response => {
            states.options = filterOptions(null, response.map(i => ({
                id: i['id'],
                parent_id: i['parent_id'],
                label: _.get(i, props.remote_cascader_options.label),
                value: _.get(i, props.remote_cascader_options.value)
            })));
        })
    }
}

const initItem = {
    'text': (p) => null,
    'textarea': (p) => null,
    'password': (p) => null,
    'number': (p) => null,
    'decimal': (p) => null,
    'date': (p) => null,
    'datetime': (p) => null,
    'time': (p) => null,
    'image': (p) => null,
    'file': (p) => null,
    'display': (p) => null,
    'association': (p) => ({}),
    'associations': (p) => [],
    'hidden': (p) => null,
    'color': (p) => null,
    'slider': (p) => null,
    'switch': (p) => null,
    'radio_group': (p) => null,
    'drag_images': (p) => [],
    'drag_associations': (p) => [],
    'options': (p) => p.props && p.props.multiple ? [] : null,
    'remote_options': (p) => p.props && p.props.multiple ? [] : null,
    'remote_cascader': (p) => p.props && p.props.multiple ? [] : null,
    'custom': (p) => null
}

const renderItem = (props, states, onChange) => {
    let r = props.resource
    let t = props.type;
    let p = props.path;

    if (t === 'display')
        return (<el-text class={"mx-6"} {...props.props}>{_.get(r, p)}</el-text>)
    if (t === 'text')
        return (<el-input modelValue={_.get(r, p)}
                          onInput={(e) => onChange(p, e)}
                          type="text"
                          {...props.props} >
            {{
                append: props.slots.append ? () => props.slots.append(_.get(r, p)) : undefined,
                suffix: props.slots.suffix ? () => props.slots.suffix(_.get(r, p)) : undefined
            }}
        </el-input>)
    else if (t === 'textarea')
        return (<el-input modelValue={_.get(r, p)}
                          onInput={(e) => onChange(p, e)}
                          type="textarea"
                          {...props.props} />)
    else if (t === 'password')
        return (<el-input modelValue={_.get(r, p)} onInput={(e) => onChange(p, e)}
                          type="password"
                          {...props.props}
                          show-password/>)
    else if (t === 'number')
        return (<el-input-number modelValue={_.get(r, p)}
                                 controls-position="right"
                                 onChange={(e) => onChange(p, e)}
                                 step={1}
                                 step-strictly={true}
                                 {...props.props} />)
    else if (t === 'decimal')
        return (<el-input-number modelValue={_.get(r, p)}
                                 controls-position="right"
                                 onChange={(e) => onChange(p, e)}
                                 step={0.01}
                                 step-strictly={true}
                                 {...props.props} />)
    else if (t === 'time')
        return (<el-time-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                arrow-control
                                {...props.props} />)
    else if (t === 'date')
        return (<el-date-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                type="date"
                                class={"w-100"}
                                {...props.props}/>)
    else if (t === 'datetime')
        return (<el-date-picker modelValue={_.get(r, p)}
                                onUpdate:modelValue={(e) => onChange(p, e)}
                                type="datetime"
                                class={"w-100"}
                                {...props.props}/>)
    else if (t === 'color')
        return (<el-color-picker modelValue={_.get(r, p)}
                                 onUpdate:modelValue={(e) => onChange(p, e)}
                                 {...props.props}/>)
    else if (t === 'slider')
        return (<el-slider modelValue={_.get(r, p)}
                           onUpdate:modelValue={(e) => onChange(p, e)}
                           {...props.props}/>)
    else if (t === 'switch')
        return (<el-switch modelValue={_.get(r, p)}
                           onUpdate:modelValue={(e) => onChange(p, e)}
                           {...props.props}/>)
    else if (t === 'image') {
        let storage_path = p.toSpliced(p.length - 1, 1, p[p.length - 1].replace('_id', ''));
        return (<el-upload
            class={"resource-form-image"}
            show-file-list={false}
            http-request={({file}) => {
                API.Storage.upload(file).then(response => {
                    onChange(p, response.data.id);
                    onChange(storage_path, response.data);
                });
            }}
        >
            {
                _.get(r, storage_path) ?
                    <div class={"uploader-image"}>
                        <el-image src={_.get(r, storage_path)['src']}/>
                    </div>
                    :
                    <el-icon class={"uploader-icon"}><Plus/></el-icon>
            }
        </el-upload>)
    } else if (t === 'file') {
        let storage_path = p.toSpliced(p.length - 1, 1, p[p.length - 1].replace('_id', ''));
        return (<el-upload
            class={"resource-form-file"}
            show-file-list={false}
            http-request={({file}) => {
                API.Storage.upload(file).then(response => {
                    onChange(p, response.data.id);
                    onChange(storage_path, response.data);
                    // _.set(r, c.prop, response.data.id);
                    // _.set(r, c.prop.replace('_id', ''), response.data);
                });
            }}
        >
            {_.get(r, storage_path) ?
                <el-text>{_.get(r, storage_path)['filename']}</el-text>
                : <el-icon class={"uploader-icon"}><Plus/></el-icon>}
        </el-upload>)
    } else if (t === 'radio_group')
        return (
            <el-radio-group modelValue={_.get(r, p)}
                            onChange={(e) => onChange(p, e)}
                            {...props.props}>
                {states.options.map(option => (
                    <el-radio label={option.value}>{option.label}</el-radio>)
                )}
            </el-radio-group>
        )
    else if (t === 'options')
        return (
            <el-select modelValue={_.get(r, p)}
                       onChange={(e) => onChange(p, e)}
                       class={"w-100"}
                       {...props.props}>
                {states.options.map(option =>
                    (<el-option key={option.value} label={option.label} value={option.value}/>)
                )}
            </el-select>
        )
    else if (t === 'remote_options')
        return (
            <el-select modelValue={_.get(r, p)}
                       onChange={(e) => onChange(p, e)}
                       class={"w-100"}
                       remote
                       loading={states.loading}
                       remoteMethod={(q) => fetchRemoteOptions(props, states, q)}
                       {...props.props}>
                {states.options.map(option =>
                    (<el-option key={option.value} label={option.label} value={option.value}/>)
                )}
            </el-select>
        )
    else if (t === 'remote_cascader')
        return (
            <el-cascader modelValue={_.get(r, p)}
                         class={"w-100"}
                         onChange={(e) => onChange(p, e)}
                         options={states.options}
                         props={
                             {
                                 ...{emitPath: false},
                                 ...props.props
                             }
                         }/>
        )
    else if (t === 'drag_images')
        return (
            <div id={p.join('_') + "_drag_images"} class={"resource-form-drag-images flex-warp"}
                 data-prop={props.props}>
                {_.get(r, p)
                    .filter(i => !('_destroy' in i) || i['_destroy'] !== true)
                    .map(item => (
                        <div class={"resource-form-drag-images-item"}>
                            <p>{item.index}, {item.id}</p>
                            <el-image src={item.image.src} fit="fill"></el-image>
                            <div class={"resource-form-drag-images-item-mask"}>
                                <el-icon class={"flex-1 icon-drag"}>
                                    <Rank/>
                                </el-icon>
                                <div class={'line'}></div>
                                <div class={"flex-1 h-100 icon-del row-center"} onClick={
                                    () => {
                                        ElMessageBox.confirm('确定删除该图片吗？', '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消',
                                            type: 'warning'
                                        }).then(() => {
                                            onChange(
                                                p,
                                                _.get(r, p).map(n => _.isEqual(item, n) ? ({...n, ...{'_destroy': true}}) : n
                                                )
                                            )
                                        })
                                    }
                                }>
                                    <el-icon><Delete/></el-icon>
                                </div>
                            </div>
                        </div>
                    ))}

                <el-upload class={"resource-form-image"}
                           show-file-list={false}
                           http-request={({file}) => {
                               API.Storage.upload(file).then(response => {
                                   onChange(
                                       p,
                                       [
                                           ..._.get(r, p),
                                           ...[{
                                               index: _.get(r, p).length,
                                               image_id: response.data.id,
                                               image: response.data
                                           }]
                                       ]
                                   )
                               })
                           }}
                           multiple>
                    <el-icon class={"uploader-icon"}><Plus/></el-icon>
                </el-upload>
            </div>
        )
}

const renderAssociation = (props, states, onChange) => {
    return (<>
        {props.columns.map(c =>
            <ResourceFormItem
                resource={props.resource}
                path={[...props.path, ...[c.prop]]}
                onChange={onChange}
                onChangeSubmit={onChange}
                {...c}/>
        )}
    </>)
}

const renderAssociations = (props, states, onChange) => {
    let r = props.resource
    let p = props.path;

    if (props.associations_layout === 'form')
        return (
            <el-row gutter={20} id={p.join('_') + "_associations"} class={"resource-form-associations"}>
                {_.get(r, p).filter(item => !(('_destroy' in item) && item['_destroy'] === true)).toSorted((a, b) => a.index - b.index)
                    .map(item =>
                        <el-col span={24}>
                            <div class={"resource-form-associations-item"}>
                                <el-row gutter={20}>
                                    <el-col span={2}>
                                        <div class={"w-100 h-100 row-center"}>
                                            <el-icon size={20} color={'#333333'} class="icon-drag">
                                                <Rank/>
                                            </el-icon>
                                        </div>
                                    </el-col>

                                    <el-col span={19}>
                                        <el-row gutter={20}>
                                            {props.columns.map(c =>
                                                <ResourceFormItem
                                                    resource={props.resource}
                                                    path={[...p, ...[_.get(r, p).findIndex(item1 => _.isEqual(item1, item)), c.prop]]}
                                                    onChange={onChange}
                                                    onChangeSubmit={onChange}
                                                    {...c}/>
                                            )}
                                        </el-row>
                                    </el-col>

                                    <el-col span={3}>
                                        <div class={"w-100 h-100 row-center"}>
                                            <el-button circle plain type="danger" icon={Delete}
                                                       onClick={() => onChange(props.path, _.get(r, p).map(item1 => _.isEqual(item1, item) ? ({...item, ...{"_destroy": true}}) : item1))}/>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-col>
                    )
                }
                <el-col span={24}>
                    <el-button type="primary" class={"w-100"} plain onClick={() => {
                        onChange(props.path, [..._.get(r, p), ...[{index: _.get(r, p).length + 1}]])
                    }}>新增
                    </el-button>
                </el-col>
            </el-row>
        )
    else if (props.associations_layout === 'table')
        return (
            <el-col span={24}>
                {props.label && <label class="el-form-item__label">{props.label}</label>}

                <el-table
                    data={_.get(r, p).filter(item => !(('_destroy' in item) && item['_destroy'] === true)).toSorted((a, b) => a.index - b.index)}
                    class="mb-10"
                    rowKey="id">
                    {props.columns.map(c => (
                        <el-table-column width={c.type === 'hidden' ? 1 : c.width}>
                            {{
                                header: () => <el-text>{c.label}</el-text>,
                                default: (scope) =>
                                    <el-row>
                                        <ResourceFormItem
                                            {...c}
                                            span={24}
                                            resource={props.resource}
                                            path={[...p, ...[_.get(r, p).findIndex(item => _.isEqual(scope.row, item)), c.prop]]}
                                            onChange={onChange}
                                            onChangeSubmit={onChange}
                                            label={null}/>
                                    </el-row>
                            }}
                        </el-table-column>
                    ))}
                    <el-table-column width={80}>
                        {{
                            header: () => <el-text>操作</el-text>,
                            default: (scope) =>
                                <el-button circle plain type="danger" icon={Delete}
                                           onClick={() => onChange(p, _.get(r, p).map(item => _.isEqual(scope.row, item) ? ({...item, ...{"_destroy": true}}) : item))}/>
                        }}
                    </el-table-column>

                </el-table>

                {props.associations_increment && <el-button type="primary" class={"w-100"} plain onClick={() => {
                    onChange(p, [..._.get(r, p), ...[{index: _.get(r, p).length + 1}]])
                }}>新增
                </el-button>}
            </el-col>
        )
}

export default defineComponent({
    name: 'ResourceFormItem',
    props: {
        resource: {
            type: Object,
        },
        path: {
            type: Array,
        },
        prop: {
            type: String,
            required: true
        },
        submit_prop: {
            type: String,
        },
        label: {
            type: String,
        },
        type: {
            type: String,
            default: 'text'
        },
        span: {
            type: Number,
            default: 12
        },
        props: {
            type: Object,
            default: {}
        },
        slots: {
            type: Object,
            default: {}
        },
        rules: {
            type: Array,
            default: []
        },
        tips: {
            type: String
        },
        options: {
            type: Array,
            default: []
        },
        remote_options: {
            type: Object,
            default: {}
        },
        remote_cascader_options: {
            type: Object,
            default: {}
        },
        associations_layout: {
            type: String,
            default: 'form'
        },
        associations_increment: {
            type: Boolean,
            default: true
        },
        visible: {
            type: Function,
        },
        condition: {
            type: Function || Boolean,
        },
        form_item_style: {
            type: Object,
            default: {}
        },
        columns: null,
        default: null,
        render: null
    },
    emits: ['change'],
    setup(props, {expose, emit}) {
        const states = ref(null);
        const initialize = () => {

            states.value = {
                options: props.options,
                loading: false
            }

            if (props.condition && !props.condition(props.resource))
                return

            if (props.type === 'display')
                return

            if (!_.has(props.resource, props.path)) {
                if (props.default) {
                    if (typeof props.default === 'function')
                        onChange(props.path, _.cloneDeep(props.default(props.resource)))
                    else
                        onChange(props.path, _.cloneDeep(props.default))
                } else {
                    onChange(props.path, initItem[props.type](props))
                }
            }

            if (props.type === 'remote_options') {
                fetchRemoteOptions(props, states.value, '');
            } else if (props.type === 'remote_cascader') {
                fetchRemoteCascader(props, states.value)
            }

            if (props.type === 'drag_images' || props.type === 'associations') {
                onChange(props.path, _.get(props.resource, props.path).toSorted((a, b) => a.index - b.index));

                nextTick().then(() => {
                    let ele = document.getElementById(props.path.join('_') + "_" + props.type)
                    if (ele) {
                        Sortable.create(ele,
                            {
                                sort: true,
                                handle: '.icon-drag',
                                onChange: function (evt) {
                                    var element = _.get(props.resource, props.path).filter(item => !(('_destroy' in item) && item['_destroy'] === true)).toSorted((a, b) => a.index - b.index)[evt.oldIndex];

                                    let items = _.get(props.resource, props.path);
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].index >= evt.newIndex)
                                            items[i].index = items[i].index + 1
                                        if (_.isEqual(items[i], element))
                                            items[i].index = evt.newIndex
                                    }

                                    onChange(props.path, items);
                                }
                            }
                        );
                    }
                })
            }
        }

        const onChange = (path, newValue) => {
            emit('change', path, newValue);
        }

        onMounted(() => {
            initialize();
        })

        return () => {
            if (props.visible && !props.visible(props.resource))
                return (<el-col span={0}></el-col>)
            else if (props.condition && !props.condition(props.resource))
                return (<el-col span={0}></el-col>)
            else if (props.render)
                return props.render(props, onChange, states.value)
            else if (props.type === 'hidden')
                return (<el-col span={0}></el-col>)
            else if (props.type === 'association')
                return (
                    <el-col span={24}>
                        <el-row gutter={20}>
                            {states.value && renderAssociation(props, states.value, onChange)}
                        </el-row>
                    </el-col>
                )
            else if (props.type === 'associations')
                return (
                    <el-col span={24}>
                        {states.value && renderAssociations(props, states.value, onChange)}
                    </el-col>
                )
            else {
                return (
                    <el-col span={props.span}>
                        <el-form-item style={props.form_item_style} label={props.label} prop={props.path}
                                      rules={props.rules} labelWidth={'auto'}>
                            {states.value && renderItem(props, states.value, onChange)}
                            {props.tips && <span class={"resource-tips"}>{props.tips}</span>}
                        </el-form-item>
                    </el-col>
                )
            }
        }
    }
})