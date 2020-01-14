import { gql } from "apollo-boost";

//Запрос списка всех событий
export const ALL_EVENTS_QUERY = gql`
  query events($TS: String!, $employeeId: String!, $ackType: String!) {
    events(TS: $TS, employeeId: $employeeId, ackType: $ackType) {
      id
      tsStart
      tsAck
      tsEnd
      ADLogin
      text
      host
      severity
      freeDuration
    }
  }
`;
//Расчет показателей за месяц
export const CALCULATE_SCORINGS = gql`
  mutation($TS: String!) {
    updateScorings(TS: $TS)
  }
`;
//Запрос списка всех смен
export const ALL_SHIFTS_QUERY = gql`
  query shifts($TS: String!) {
    shifts(TS: $TS) {
      id
      start
      end
      employeeId
      ackInTimeEventsCount
      ackNotInTimeEventsCount
      noAckEventsCount
      tooShortEventsCount
      normalEventsCount
      freeDurationSum
    }
  }
`;
//Добавление смены
export const ADD_SHIFT_MUTATION = gql`
  mutation($start: String!, $end: String!, $employeeId: String!) {
    addShift(start: $start, end: $end, employeeId: $employeeId) {
      id
      start
      end
      employeeId
    }
  }
`;
//Обновление данных по смене
export const UPDATE_SHIFT_MUTATION = gql`
  mutation($id: String!, $start: String!, $end: String!, $employeeId: String!) {
    updateShift(id: $id, start: $start, end: $end, employeeId: $employeeId) {
      id
      start
      end
      employeeId
    }
  }
`;
//Удаление смены
export const DELETE_SHIFT_MUTATION = gql`
  mutation($id: String) {
    deleteShift(id: $id)
  }
`;

//Запрос списка всех сотрудников
export const EMPLOYEES_QUERY = gql`
  query employees($type: String) {
    employees(type: $type) {
      id
      fullName
      ADLogin
      isRegular
      visibleColor
      isActive
    }
  }
`;
//Добавление сотрудника
export const ADD_EMPLOYEE_MUTATION = gql`
  mutation(
    $fullName: String!
    $ADLogin: String!
    $isRegular: Boolean!
    $visibleColor: String!
  ) {
    addEmployee(
      fullName: $fullName
      ADLogin: $ADLogin
      isRegular: $isRegular
      visibleColor: $visibleColor
    ) {
      id
      fullName
      ADLogin
      isRegular
      visibleColor
    }
  }
`;
//Обновление данных сотрудника
export const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation(
    $id: String!
    $fullName: String!
    $ADLogin: String!
    $isRegular: Boolean!
    $visibleColor: String!
  ) {
    updateEmployee(
      id: $id
      fullName: $fullName
      ADLogin: $ADLogin
      isRegular: $isRegular
      visibleColor: $visibleColor
    ) {
      id
      fullName
      ADLogin
      isRegular
      visibleColor
    }
  }
`;
//Удаление сотрудника
export const DELETE_EMPLOYEE_MUTATION = gql`
  mutation($id: String) {
    deleteEmployee(id: $id)
  }
`;
//Восстановление сотрудника
export const RESTORE_EMPLOYEE_MUTATION = gql`
  mutation($id: String) {
    restoreEmployee(id: $id)
  }
`;
//Запрос оценок
export const ALL_SCORINGS_QUERY = gql`
  query scorings($TS: String!) {
    scorings(TS: $TS) {
      id
      employeeId
      employeeFullName
      tooShortEventsCount
      normalEventsCount
      avgAckTime
      percentAckInTime
      percentAckNotInTime
      percentNoAck
      theQuickest
      theBest
      doneNorm
    }
  }
`;
