<template>
    <v-app>
        <v-toolbar dark app class="primary">
            <v-toolbar-title v-text="'Дежурства отедла СПДиТ'"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-btn v-for="(item,i) in menuItems" flat :key="`menuItem${i}`" :to="item.route">
                <v-icon left v-html="item.icon"></v-icon>
                {{item.title}} 
            </v-btn>
        </v-toolbar-items>
        </v-toolbar>
    </v-app>
</template>

<script>
    export default {
        computed:{
            menuItems(){
                return [
                    {
                        icon: 'visibility',
                        title: 'График',
                        route: '/chart'
                    },
                    {
                        icon: 'extension',
                        title: 'Сотрудники',
                        route: '/employees'
                    },
                    {
                        icon: 'account_circle',
                        title: 'Эффективность',
                        route: '/efficiency'
                    },
                    {
                        icon: 'exit_to_app',
                        title: 'Выйти',
                        route: '/logout'
                    },
                    {
                        icon: 'input',
                        title: 'Войти',
                        route: '/login'
                    }
                ]
            }
        }        
    }
</script>

<style scoped>

</style>