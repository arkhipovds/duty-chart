import { gql } from "apollo-boost";

// для компактности выделяем фрагмент gql,
// его мы будем часто использовать. Этот фрагмент - наша структура таблицы  !!!!!!!!!!!!!!!!!!!!TODO использовать фрагмены в запросах
export const fragmentSh = gql`
  fragment Shift on Shift {
    id
    start
    end
    employeeId
  }
`;

export const fragmentE = gql`
  fragment Employee on Employee {
    id
    fullName
  }
`;


export const ALL_SHIFTS_QUERY = gql`
query Shifts {
    Shifts {
        id,
        start,
        end,
        employeeId
    }
}
`;
//Запрос на добавление смены
export const ADD_SHIFT_MUTATION = gql`
    mutation($start: String!, $end: String!, $employeeId: String!) {
        addShift(start: $start, end: $end, employeeId: $employeeId) {
            id,
            start,
            end,
            employeeId
        }
    }
`;
//Запрос на обновление данных по смене
export const UPDATE_SHIFT_MUTATION = gql`
    mutation($id: String!, $start: String!, $end: String!, $employeeId: String!) {
        updateShift(id: $id, start: $start, end: $end, employeeId: $employeeId) {
            id,
            start,
            end,
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
        id,
        fullName,
        isRegular,
        visibleColor
    }
}
`;
//Запрос на добавление сотрудника
export const ADD_EMPLOYEE_MUTATION = gql`
    mutation($fullName: String!, $isRegular: Boolean!, $visibleColor: String!) {
        addEmployee(fullName: $fullName, isRegular: $isRegular, visibleColor: $visibleColor) {
            id,
            fullName,
            isRegular,
            visibleColor
        }
    }
`;
//Запрос на обновление данных по сотруднику
export const UPDATE_EMPLOYEE_MUTATION = gql`
    mutation($id: String!, $fullName: String!, $isRegular: Boolean!, $visibleColor: String!) {
        updateEmployee(id: $id, fullName: $fullName, isRegular: $isRegular, visibleColor: $visibleColor) {
            id,
            fullName,
            isRegular,
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



/*
export const UPDATE_PHONE_MUTATION = gql`
  mutation($id: ID!, $number: String!, $name: String!) {
    updatePhoneByID(id: $id, number: $number, name: $name) {
      ...Phone
    }
  }
  ${fragment}
`;
*/