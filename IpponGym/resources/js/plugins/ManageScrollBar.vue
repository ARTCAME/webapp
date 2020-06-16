<script>
    export default {
        install (Vue, options) {
            /**
             * Function to prevent jumps when scroll bar isn't present and shows modal (modal-open adds 15px of padding-right and the added class neutralizes it). In addition, adds a bootstrap modal-open class to html tag
             */
            Vue.prototype.$manageScrollBar = function() {
                const hasScrollBar = document.documentElement.scrollHeight > document.documentElement.clientHeight || document.documentElement.scrollHeight > document.documentElement.innerHeight;
                if (!hasScrollBar) {
                    document.body.classList.toggle('neutral-scroll');
                }
                if (hasScrollBar) {
                    document.getElementsByTagName('html')[0].classList.toggle('modal-open');
                }
            }
        }
    }
</script>
