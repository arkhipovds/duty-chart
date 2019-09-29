<template>
    <div>
        <v-navigation-drawer absolute temporary height="auto" v-model="drawer" class="hidden-md-and-up">

                <v-list-item v-for="(item,i) in menuItems" :key="`navdrawer${i}`">
                    <v-list-item-action>
                        <v-icon left>{{item.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title v-text="item.title"></v-list-item-title>                      
                    </v-list-item-content>
                 </v-list-item>

        </v-navigation-drawer>
        <v-app-bar dark app class="primary">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>
                <router-link to="/" tag="span">
                    <v-toolbar-title v-text="'Дежурства отедла СПДиТ'"></v-toolbar-title>
                </router-link>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-sm-and-down">
                <v-btn v-for="(item,i) in menuItems" text :key="`menuItem${i}`" :to="item.route">
                    <v-icon left>{{item.icon}}</v-icon> 
                    {{item.title}} 
                </v-btn>
            </v-toolbar-items>
        </v-app-bar>
    </div>
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
                        icon: 'mdi-calendar-text',
                        title: 'График',
                        route: '/chart'
                    },
                    {
                        icon: 'mdi-human-greeting',
                        title: 'Сотрудники',
                        route: '/employees'
                    },
                    {
                        icon: 'mdi-trending-up',
                        title: 'Эффективность',
                        route: '/efficiency'
                    },
                    {
                        icon: 'mdi-login',
                        title: 'Войти',
                        route: '/login'
                    },
                    {
                        icon: 'mdi-logout',
                        title: 'Выйти',
                        route: '/logout'
                    }                    
                ]
            }
        }        
    }
</script>

<style scoped>

</style>