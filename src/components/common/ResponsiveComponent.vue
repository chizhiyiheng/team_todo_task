import { computed, defineComponent, h, resolveComponent } from 'vue'

export const ResponsiveComponent = defineComponent({
  name: 'ResponsiveComponent',
  props: {
    pcComponent: {
      type: String,
      required: true
    },
    mobileComponent: {
      type: String,
      required: true
    },
    pcProps: {
      type: Object,
      default: () => ({})
    },
    mobileProps: {
      type: Object,
      default: () => ({})
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const currentComponent = computed(() => {
      return props.isMobile ? props.mobileComponent : props.pcComponent
    })

    const currentProps = computed(() => {
      return props.isMobile ? props.mobileProps : props.pcProps
    })

    return () => {
      const component = resolveComponent(currentComponent.value)
      return h(component, currentProps.value, slots)
    }
  }
})

export default ResponsiveComponent