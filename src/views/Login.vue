<template>
    <div>
        <v-container class="fill-height" fluid>
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="4">
                    <v-card class="elevation-12">
                        <v-toolbar color="primary" dark flat>
                            <v-toolbar-title>Вход</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                            <v-form>
                            <v-text-field label="учетная запись" name="login" prepend-icon="mdi-account" type="text"></v-text-field>
                            <v-text-field id="password" label="пароль" name="password" prepend-icon="mdi-lock-outline" type="password"></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary">Войти</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                login: null,
                password: null
            }
        }
        
    }
</script>

<style lang="scss" scoped>

</style>