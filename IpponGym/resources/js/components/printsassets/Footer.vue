<template>
    <b-row>
        <b-col class="sign-ctn">
            <img
                class="sign-img-doc"
                type="image/png"
                :src="sign">
            <small class="d-block">Firmado: {{ name }}</small>
            <small>En Zaragoza a {{ this.$moment().format('dddd, D MMMM YYYY')}}</small>
        </b-col>
    </b-row>
</template>
<script>
    export default {
        props: [
            'name',
            'sign',
        ]
    }
</script>
