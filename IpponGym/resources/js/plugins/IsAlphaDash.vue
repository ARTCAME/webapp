<script>
    export default {
        install (Vue, options) {
            /**
             * Function to prevent type/copy symbols on alphabetical and dash field
             *
             * @param {Event} event: The typing event
             */
            Vue.prototype.$isAlphaDash = function(event) {
                event = (event) ? event : window.event;
                if (event.type == 'paste') {
                    event.preventDefault();
                    let input = event.clipboardData.getData('text');
                    input = input.replace(new RegExp('[^A-Za-z-]', 'g'), '');
                    return input;
                } else {
                    var charCode = (event.which) ? event.which : event.keyCode;
                    if ((charCode != 45 /* Dash */) && (charCode != 32 /* Space */) && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
                        event.preventDefault();
                    } else {
                        return true;
                    }
                }
            }
        }
    }
</script>
