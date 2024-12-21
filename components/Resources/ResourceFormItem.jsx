import _ from "lodash-es";
import API from "@/api";
import {Delete, Plus, Rank, UploadFilled, CircleCheck, CircleClose, Document} from "@element-plus/icons-vue";
import {ElMessageBox} from "element-plus";
import {defineComponent, onMounted, ref, nextTick} from "vue";
import Sortable from 'sortablejs';
import {useI18n} from 'vue-i18n'

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

const filterOptions = (options) => {
    const map = new Map();
    const result = [];

    options.forEach(item => {
        map.set(item.id, {...item, children: []});
    });

    map.forEach(item => {
        if (map.has(item.parent_id)) {
            map.get(item.parent_id).children.push(item);
        } else {
            result.push(item);
        }
    });

    return result;
};

const fetchRemoteCascader = (props, states) => {
    if (props.remote_cascader_options.remote) {
        props.remote_cascader_options.remote().then(response => {
            states.options = filterOptions(response.map(i => ({
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
    'drag_files': (p) => [],
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
        let storage_path = p.slice(0, p.length - 1) + p[p.length - 1].replace('_id', '');
        return (<div>
            <el-upload
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
            </el-upload>
            {_.get(r, storage_path) ? <el-button type={"danger"} class={"w-100"} onClick={
                () => {
                    ElMessageBox.confirm('确定删除该图片吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        onChange(p, null);
                        onChange(storage_path, null);
                    })
                }
            }>删除</el-button> : null}
        </div>)
    } else if (t === 'file') {
        let storage_path = p.slice(0, p.length - 1) + p[p.length - 1].replace('_id', '');
        return (<el-upload
            class={"resource-form-file"}
            {...props.props}
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
                         }
                         {...props.props}/>
        )
    else if (t === 'drag_images')
        return (
            <div id={p.join('_') + "_drag_images"} class={"resource-form-drag-images flex-warp"}
                 data-prop={props.props}>
                {_.sortBy(_.get(r, p)
                    .filter(i => !('_destroy' in i) || i['_destroy'] !== true), ['index'])
                    .map((item, index) => (
                        <div class={"resource-form-drag-images-item"} key={new Date().getTime() + index}>
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
                    ))
                }
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
    else if (t === 'drag_files')
        return (
            <div id={p.join('_') + "_drag_files"} class={"resource-form-drag-files"}
                 data-prop={props.props}>
                <el-upload class={"resource-form-drag-file"}
                           show-file-list={false}
                           http-request={({file}) => {
                               API.Storage.upload(file).then(response => {
                                   onChange(
                                       p,
                                       [
                                           ..._.get(r, p),
                                           ...[{
                                               [props.columns[0].prop]: _.get(r, p).length,
                                               [props.columns[1].prop]: response.data.id,
                                               [props.columns[1].prop.split('_')[0]]: response.data
                                           }]
                                       ]
                                   )
                               })
                           }}
                           multiple
                           {...props.props}>
                    <el-icon class={"uploader-icon"}><UploadFilled/></el-icon>
                </el-upload>
                <div class={'resource-form-drag-file-list'}>
                    {_.sortBy(_.get(r, p)
                        .filter(i => !('_destroy' in i) || i['_destroy'] !== true), ['index'])
                        .map((item, index) => {
                            return (
                                <div class={'resource-form-drag-file-list-item'}>
                                    <div class={"row-center gap-5"}>
                                        <el-icon><Document/></el-icon>
                                        <p class={'resource-form-drag-file-list-item-text'}>
                                            {_.get(item, [props.columns[1].prop.split('_')[0], 'filename'])}
                                        </p>
                                    </div>
                                    <el-icon color="#67C23A" class={"resource-form-drag-file-list-item-icon"}>
                                        <CircleCheck/>
                                    </el-icon>
                                    <el-icon class={"resource-form-drag-file-list-item-icon"} onClick={
                                        () => {
                                            onChange(
                                                p,
                                                _.get(r, p).map(n => _.isEqual(item, n) ? ({...n, ...{'_destroy': true}}) : n
                                                )
                                            )
                                        }
                                    }><CircleClose/></el-icon>
                                </div>
                            )
                        })
                    }
                </div>
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

const renderAssociations = (props, states, onChange, t) => {
    let r = props.resource
    let p = props.path;

    if (props.associations_layout === 'form')
        return (
            <el-row gutter={20} id={p.join('_') + "_associations"} class={"resource-form-associations"}>
                {_.sortBy(_.get(r, p).filter(item => !(('_destroy' in item) && item['_destroy'] === true)), ['index'])
                    .map((item, index) =>
                        <el-col span={24} key={new Date().getTime() + index}>
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
                                                    onChange={(path, newValue) => {
                                                        onChange([...p, ...[_.get(r, p).findIndex(item1 => _.isEqual(item1, item)), c.prop]], newValue)
                                                    }}
                                                    onChangeSubmit={(path, newValue) => {
                                                        onChange([...p, ...[_.get(r, p).findIndex(item1 => _.isEqual(item1, item)), c.prop]], newValue)
                                                    }}
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
                    }}>{t('resources.add')}
                    </el-button>
                </el-col>
            </el-row>
        )
    else if (props.associations_layout === 'table')
        return (
            <el-col span={24}>
                {props.label && <label class="el-form-item__label">{props.label}</label>}

                <el-table
                    data={_.sortBy(_.get(r, p).filter(item => !(('_destroy' in item) && item['_destroy'] === true)), ['index'])}
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
                }}>{t('resources.add')}
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
        const {t} = useI18n();

        const states = ref(null);

        const DraggableList = ref({})
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

            if (props.type === 'drag_images' || props.type === 'associations' || props.type === 'drag_files') {
                onChange(props.path, _.sortBy(_.get(props.resource, props.path), ['index']));

                nextTick().then(() => {
                    initDraggable(props)
                })
            }
        }

        const initDraggable = (props) => {
            let ele_name = props.path.join('_') + "_" + props.type
            let ele = document.getElementById(ele_name)
            if (ele) {
                let options = {
                    handle: '.icon-drag',
                    group: ele_name,
                    // sort: false,
                    onEnd(e) {
                        // console.log('onEnd')

                        let oldIndex = e.oldDraggableIndex;
                        let newIndex = e.newDraggableIndex;
                        if (oldIndex === newIndex) return;

                        let items = _.cloneDeep(_.get(props.resource, props.path))
                        let element = items[oldIndex];
                        items.splice(oldIndex, 1);
                        items.splice(newIndex, 0, element);
                        for (let i = 0; i < items.length; i++) {
                            if (items[i]['_destroy'] === true) {
                                items[i]['index'] = -1
                            } else {
                                items[i]['index'] = i
                            }
                        }
                        nextTick().then(() => {
                            onChange(props.path, _.sortBy(items, ['index']));
                        })
                    },
                    onChange: function (evt) {
                        // console.log('onChange')
                        // var element = _.sortBy(_.get(props.resource, props.path).filter(item => !(('_destroy' in item) && item['_destroy'] === true), ['index']))[evt.oldIndex];
                        //
                        // let items = _.get(props.resource, props.path);
                        // for (let i = 0; i < items.length; i++) {
                        //     if (items[i].index >= evt.newIndex)
                        //         items[i].index = items[i].index + 1
                        //     if (_.isEqual(items[i], element))
                        //         items[i].index = evt.newIndex
                        // }
                        // onChange(props.path, items);
                    },
                    onUpdate(e) {
                        // console.log('onUpdate')
                    },
                    // onSort(e) {
                    //     console.log('onSort')
                    // },
                }

                if (props.type === 'drag_images') {
                    // options['dragClass'] = 'resource-form-drag-images-item'
                    options['draggable'] = '.resource-form-drag-images-item'
                    options['filter'] = '.resource-form-image'
                }
                if (_.get(DraggableList.value, ele_name)) {
                    _.get(DraggableList.value, ele_name).destroy();
                }
                let SortableValue = Sortable.create(ele, options);
                _.set(DraggableList.value, ele_name, SortableValue)
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
                return (states.value && renderAssociation(props, states.value, onChange))
            else if (props.type === 'associations')
                return (
                    <el-col span={24}>
                        {states.value && renderAssociations(props, states.value, onChange, t)}
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