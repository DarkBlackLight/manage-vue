import {defineComponent, ref, provide} from "vue";
import {Close, Minus, FullScreen} from "@element-plus/icons-vue";
import './ResourceDialog.scss';

export default defineComponent({
    name: 'ResourceDialog',
    props: {
        title: String,
        width: String,
        className: String
    },
    setup(props, {expose, slots}) {
        const displayDialog = ref(false);
        const fullscreen = ref(false);

        const onToggle = () => {
            displayDialog.value = !displayDialog.value;
        }

        provide('_fullscreen', fullscreen)

        expose({onToggle})

        return () => (
            <el-dialog v-model={displayDialog.value}
                       class={['resource-dialog', props.className]}
                       show-close={false}
                       destroy-on-close
                       fullscreen={fullscreen.value}
                       width={props.width ? props.width : '50%'}>
                {{
                    header: () => <div className="row-justify-space-between align-center">
                        <div className="el-dialog-custom-title">
                            <p>{props.title}</p>
                            <div className="el-dialog-custom-title-bg"></div>
                        </div>

                        <div className="row-align-center icon-group">
                            <el-icon v-show={fullscreen.value} size="18" onClick={() => {
                                fullscreen.value = false;
                            }}>
                                <Minus/>
                            </el-icon>
                            <el-icon v-show={!fullscreen.value} size="18" onClick={() => {
                                fullscreen.value = true;
                            }}>
                                <FullScreen/>
                            </el-icon>
                            <el-icon size="18" onClick={() => displayDialog.value = !displayDialog.value}>
                                <Close/>
                            </el-icon>
                        </div>
                    </div>,
                    default: () => slots.default(),
                    ...(slots.footer) && {footer: () => slots.footer()}
                }}
            </el-dialog>
        )
    }
})