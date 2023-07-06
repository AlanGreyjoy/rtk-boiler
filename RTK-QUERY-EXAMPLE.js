// ** Create an API
// ** This is just a fast and dirty example, not a full implementation!!!
// ** I normally store these in /src/store/api/NameOfApiService.js
// ** I then import them into /src/store/index.js

//#region RTK-QUERY-EXAMPLE.js------------------------------------------------------------------------------------------------
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
    prepareHeaders: (headers, { getState }) => {
      const token = window.localStorage.getItem("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["User"],

  endpoints: (builder) => ({
    // ** Get All Users
    getUsers: builder.query({
      query: (domain) => ({
        url: `/users`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // ** Get a User by Id
    getUserById: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
    }),

    // ** Create a User
    createUser: builder.mutation({
      query: (data) => ({
        url: `/users`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // ** Update a User
    updateUser: builder.mutation({
      query: (data) => ({
        url: `/users/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // ** Delete a User
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = dnsManagerApi;

//#endregion RTK-QUERY-EXAMPLE.js------------------------------------------------------------------------------------------------

//#region Usage------------------------------------------------------------------------------------------------
// ** Any Component, anywhere in the app

import { useGetUsersQuery } from "./RTK-QUERY-EXAMPLE.js";

// ** Or, if you are using mutliple endpoints
import { useGetUsersQuery, useGetUserByIdQuery } from "./RTK-QUERY-EXAMPLE.js";

// ** React Hook Form
// ** https://react-hook-form.com/
// ** Very basic usage, just to show how to use it with RTK Query
import { Controller, useForm } from "react-hook-form";

const UsersTable = () => {
  const { data, error, isLoading } = useGetUsersQuery();

  //#region RTK QUERY------------------------------------------------------------------------------------------------
  // ** If using multiple endpoints
  const [userId, setUserId] = useState(null);
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useGetUsersQuery();

  // ** This will only run if userId is not null
  // ** RTK Query will automatically fetch the data for you and cache it!
  const {
    data: userById,
    error: userByIdError,
    isLoading: userByIdIsLoading,
  } = useGetUserByIdQuery(userId, { skip: !userId });
  //#endregion RTK QUERY------------------------------------------------------------------------------------------------

  //#region React Hook Form------------------------------------------------------------------------------------------------
  // ** POST Example
  const [createUser, { isLoading: createUserIsLoading }] =
    useCreateUserMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const handleCreateUser = async () => {
    const data = {
      firstName: "John",
      lastName: "Doe",
    };

    await createUser(data)
      .unwrap()
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  };
  //#endregion React Hook Form------------------------------------------------------------------------------------------------

  return (
    <>
      {/* New User Form */}
      <div>
        <form onSubmit={handleSubmit(handleCreateUser)}>
          <div>
            <label htmlFor='firstName'>First Name</label>
            <Controller
              name='firstName'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='First Name'
                  className={errors.firstName ? "is-invalid" : ""}
                />
              )}
            />
            {errors.firstName && (
              <div className='invalid-feedback'>First Name is required</div>
            )}

            <label htmlFor='lastName'>Last Name</label>
            <Controller
              name='lastName'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='Last Name'
                  className={errors.lastName ? "is-invalid" : ""}
                />
              )}
            />
            {errors.lastName && (
              <div className='invalid-feedback'>Last Name is required</div>
            )}

            <button type='submit' disabled={createUserIsLoading}>
              {createUserIsLoading ? "Loading..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
      {/* Users table */}
      <div>
        {usersIsLoading && <div>Loading...</div>}
        {usersError && <div>{error}</div>}
        {users && (
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>First Name</th>
                <th>Last Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
//#endregion Usage------------------------------------------------------------------------------------------------
