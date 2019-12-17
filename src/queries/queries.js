import { gql } from "apollo-boost";

//Запрос списка всех событий
export const ALL_EVENTS_QUERY = gql`
  query events($TS: String!, $employeeId: String!) {
    events(TS: $TS, employeeId: $employeeId) {
      id
      tsStart
      tsAck
      tsEnd
      ADLogin
      text
      host
      severity
      freeDuration
      isForgiven
    }
  }
`;
//Запрос на расчет показателей за месяц
export const CALCULATE_SCORINGS = gql`
  mutation($TS: String!) {
    calculateScorings(TS: $TS)
  }
`;
//Запрос списка всех смен
export const ALL_SHIFTS_QUERY = gql`
  query Shifts($TS: String!) {
    Shifts(TS: $TS) {
      id
      start
      end
      employeeId
      ackInTimeEventsCount
      ackNotInTimeEventsCount
      noAckEventsCount
      tooShortEventsCount
      normalEventsCount
    }
  }
`;
//Запрос на добавление смены
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
//Запрос на обновление данных по смене
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
//Запрос на удаление смены
export const DELETE_SHIFT_MUTATION = gql`
  mutation($id: String) {
    deleteShift(id: $id)
  }
`;

//Запрос списка всех сотрудников
export const ALL_EMPLOYEES_QUERY = gql`
  query Employees {
    Employees {
      id
      fullName
      ADLogin
      isRegular
      visibleColor
    }
  }
`;
//Запрос списка активных сотрудников
export const ACTIVE_EMPLOYEES_QUERY = gql`
  query Employees {
    activeEmployees {
      id
      fullName
      ADLogin
      isRegular
      visibleColor
    }
  }
`;
//Запрос на добавление сотрудника
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
//Запрос на обновление данных по сотруднику
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
//Запрос на удаление сотрудника
export const DELETE_EMPLOYEE_MUTATION = gql`
  mutation($id: String) {
    deleteEmployee(id: $id)
  }
`;
//Запрос оценок
export const ALL_SCORINGS_QUERY = gql`
  query scorings($TS: String!) {
    scorings(TS: $TS) {
      id
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
