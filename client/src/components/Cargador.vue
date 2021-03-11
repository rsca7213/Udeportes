<template>
<div>
    <!-- Pretty loading animation that popups when a main view component is loading -->
    <div class="load">
        <hr>
        <hr>
        <hr>
        <hr>
    </div>
    <div class="load-text text-h5">
        Cargando
    </div>
</div>
</template>

<script>
export default {
    name: 'Cargador'
}
</script>

<style>
    .load{
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        width:100px;
        height:100px;
    }
    .load-text {
        position: absolute;
        top: 60%;
        width: 100%;
        text-align: center;
    }
    .load hr{border:0;
        margin:0;
        width:40%;
        height:40%;
        position:absolute;
        border-radius:50%;
        animation:spin 2s ease infinite
    }

    .load :first-child{
        background:#3490DC;
        animation-delay:-1.5s
    }
    .load :nth-child(2){
        background: #9561e2;
        animation-delay:-1s
    }
    .load :nth-child(3){
        background:#38C172;
        animation-delay:-0.5s
    }
    .load :last-child{
        background:#f66d9b
    }

    @keyframes spin{
        0%,100%{transform:translate(0)}
        25%{transform:translate(160%)}
        50%{transform:translate(160%, 160%)}
        75%{transform:translate(0, 160%   )}
    }
</style>