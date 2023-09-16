import {defineComponent, ref} from "vue";
import {Close} from "@element-plus/icons-vue";
import './ResourceDialog.scss';

export default defineComponent({
    name: 'ResourceDialog',
    props: {
        title: String,
        width: String
    },
    setup(props, {expose, slots}) {
        const displayDialog = ref(false);

        const onToggle = () => {
            displayDialog.value = !displayDialog.value;
        }

        expose({onToggle})

        return () => (
            <el-dialog v-model={displayDialog.value}
                       class='resource-dialog'
                       show-close={false}
                       destroy-on-close
                       width={props.width ? props.width : '50%'}>
                {{
                    header: () => <div className="row-justify-space-between align-center" style="margin-right: 0">
                        <h4 className="my-0">{props.title}</h4>
                        <el-button icon={Close} link
                                   onClick={() => displayDialog.value = !displayDialog.value}/>
                    </div>,
                    default: () =>
                        <el-scrollbar max-height="50vh">
                            <div style={{padding: '0 10px'}}>
                                {() => slots.default()}
                            </div>
                        </el-scrollbar>,
                    ...(slots.footer) && {footer: () => slots.footer()}
                }}
            </el-dialog>
        )
    }
})