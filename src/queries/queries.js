import { gql } from "apollo-boost";

// для компактности выделяем фрагмент gql,
// его мы будем часто использовать. Этот фрагмент - наша структура таблицы
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
//Описываем запрос на добавление в формате GraphQL
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
//Описываем запрос на добавление в формате GraphQL
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


export const DELETE_EMPLOYEE_MUTATION = gql`
    mutation($id: String) {
        deleteEmployee(id: $id)
    }
`;



/*
export const DELETE_PHONE_MUTATION = gql`
  mutation($id: ID!) {
    deletePhoneByID(id: $id)
  }
`;

export const UPDATE_PHONE_MUTATION = gql`
  mutation($id: ID!, $number: String!, $name: String!) {
    updatePhoneByID(id: $id, number: $number, name: $name) {
      ...Phone
    }
  }
  ${fragment}
`;
*/