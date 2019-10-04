<template>
  <div>
    <h1>Тут будет оценка эффективности работы дежурных</h1>

    <v-layout wrap>
      <v-flex xs12>
        <v-form v-model="valid" ref="form">
          <v-layout  wrap>
            <v-flex xs3 v-for="option in selectOptions" :key="option.text">
              <v-checkbox :label="option.text" v-model="selected" :value="option.value"></v-checkbox>
            </v-flex>
            <v-flex xs3>
              <v-btn small class="primary">save</v-btn>
            </v-flex>
          </v-layout>
        </v-form>
        <p>selected options : {{selected}}</p>
      </v-flex>
    </v-layout>
  </div>
</template>


<script>
    export default{
        data(){
            return {
                valid: false,
                selected:[],
                selectOptions:[
                    {text: 'Apples', value: 'apple'},
                    {text: 'Oranges', value: 'orange'},
                    {text: 'Grapes', value: 'grape'}
                ]
            }
        },
        }
    
</script> 
    <!--
    <v-col>
      <v-sheet height="500">
        <v-calendar
          :now="today"
          :value="today"
          color="primary"
        >
          <template v-slot:day="{ present, past, date }">
            <v-row
              class="fill-height"
            >
              <template v-if="past && tracked[date]">
                <v-sheet
                  v-for="(percent, i) in tracked[date]"
                  :key="i"
                  :title="category[i]"
                  :color="colors[i]"
                  :width="`${percent}%`"
                  height="100%"
                  tile
                ></v-sheet>
              </template>
            </v-row>
          </template>
        </v-calendar>
      </v-sheet>
    </v-col>
    -->

<!--
<script>
  export default {
    data: () => ({
      today: '2019-01-10',
      tracked: {
        '2019-01-09': [23, 45, 10],
        '2019-01-08': [10],
        '2019-01-07': [0, 78, 5],
        '2019-01-06': [0, 0, 50],
        '2019-01-05': [0, 10, 23],
        '2019-01-04': [2, 90],
        '2019-01-03': [10, 32],
        '2019-01-02': [80, 10, 10],
        '2019-01-01': [20, 25, 10],
      },
      colors: ['#1867c0', '#fb8c00', '#000000'],
      category: ['Development', 'Meetings', 'Slacking'],
    }),
  }
</script>

<style lang="scss" scoped>

</style>
-->