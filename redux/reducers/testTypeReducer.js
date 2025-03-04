import {
  GET_TEST_TYPES,
  CREATE_TEST_TYPE,
  UPDATE_TEST_TYPE,
  DELETE_TEST_TYPE,
  TEST_TYPE_ERROR,
    TEST_TYPE_ERROR_CLEAR,
} from "../actions/testTypeActions";

const initialState = {
  testTypes: [],
  error: null,
};

const testTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TEST_TYPES:
      return { ...state, testTypes: action.payload };
    case CREATE_TEST_TYPE:
      return { ...state, testTypes: [...state.testTypes, action.payload] };
    case UPDATE_TEST_TYPE:
      return {
        ...state,
        testTypes: state.testTypes.map((testType) =>
          testType._id === action.payload._id ? action.payload : testType
        ),
      };
    case DELETE_TEST_TYPE:
      return {
        ...state,
        testTypes: state.testTypes.filter(
          (testType) => testType._id !== action.payload
        ),
      };
    case TEST_TYPE_ERROR:
      return { ...state, error: action.payload };
    case TEST_TYPE_ERROR_CLEAR:
      return { ...state, error: "" };
    default:
      return state;
  }
};

export default testTypeReducer;
