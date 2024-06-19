import {defineComponent, ref, provide} from "vue";
import {Close, Minus, FullScreen} from "@element-plus/icons-vue";
import './ResourceDialog.scss';
import {MobileUA} from "../../config/tools";

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
            if (MobileUA.SMART_PHONE || MobileUA.TOUCH_DEVICE) {
                fullscreen.value = true
            } else {
                fullscreen.value = false
            }

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
                    header: () => <div class="row-justify-space-between align-center">
                        <div class="el-dialog-custom-title">
                            <p>{props.title}</p>
                            <div class="el-dialog-custom-title-bg"></div>
                        </div>

                        <div class="row-align-center icon-group">
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