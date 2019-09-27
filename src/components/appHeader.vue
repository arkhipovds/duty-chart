<template>
    <v-app-bar>
        <v-navigation-drawer absolute temporary v-model="drawer">
            <v-list>
                <v-list-tile v-for="(item,i) in menuItems" :key="`drawerItem${i}`">
                    <v-list-tile-action>
                        <!-- <v-icon left>item.icon</v-icon> -->
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="item.title"></v-list-tile-title>
                    </v-list-tile-content>
                 </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar dark app class="primary">
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title v-text="'Дежурства отедла СПДиТ'"></v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn v-for="(item,i) in menuItems" text :key="`menuItem${i}`" :to="item.route">
        <!--          <v-icon left>item.icon</v-icon> -->
                    {{item.title}} 
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
    </v-app-bar>
</template>

<script>
    export default {
        data(){
            return{
                drawer: false
            }
        },
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