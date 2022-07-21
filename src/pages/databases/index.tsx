import type { NextPage } from "next";
import Head from "next/head";
import React, { createRef, useEffect, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import FluidLayout from "../../components/UI/FluidLayout";
import { Prisma } from "@prisma/client";
import { useToast } from "../../utils/hooks";
import { XIcon } from "@heroicons/react/solid";

const clientStrings = [
  { value: "Prisma", label: "Prisma" },
  { value: "Laravel", label: "Laravel" },
  { value: "Nodejs", label: "Nodejs" },
  { value: "Django", label: "Django" },
];

const createCopyString = (database: any, selectedClient: any) => {
  if (selectedClient === "Prisma") {
    return (
      `DATABASE_URL=postgres://` +
      database.clientUsername +
      `:` +
      database.clientPassword +
      `@` +
      database.databaseHost.hostname +
      `/` +
      database.clientDatabaseName +
      `?sslaccept=strict`
    );
  }
};

const DeleteModal = (database: any, onConfirm: any) => {
  const confirmRef = createRef<HTMLInputElement>();
  const toggleref = createRef<HTMLLabelElement>();
  const toast = useToast(4000);

  const validateDelete = () => {
    // check the value of the input vs the name
    if (confirmRef?.current?.value !== database.clientUsername) {
      toast("error", "You must match the username to delete the database");
      return false;
    }
    toggleref?.current?.click();
    onConfirm();
  };

  return (
    <>
      <input
        type="checkbox"
        id={"delete-modal-" + database?.id}
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box bg-red-200 text-primary-content">
          <h3 className="text-lg font-bold">Remove Database?</h3>
          <p className="py-4">
            Are you sure you want to remove this database?{" "}
            <i className="text-red-500">This action is not reversible!</i> To
            remove please enter in the user of the database below. (
            {database?.clientUsername})
          </p>
          <input
            type="text"
            placeholder={database?.clientUsername}
            ref={confirmRef}
            className="input input-bordered input-ghost input-error w-full max-w-xs text-black"
          />
          <div className="modal-action">
            <label
              ref={toggleref}
              hidden
              htmlFor={"delete-modal-" + database?.id}
              className="hidden "
            ></label>
            <label className="btn btn-accent" onClick={validateDelete}>
              Yes! Delete
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const userDatabases = trpc.useQuery(["databases.get-user-databases"]);
  const [selectedClient, setSelectedClient] = useState("Prisma");
  const [databaseUpdateChange, setDatabaseUpdateChange] = useState(true);
  const clientSelectedValue = useRef("");
  useEffect(() => {
    clientSelectedValue.current = selectedClient;
  }, [selectedClient]);

  const toast = useToast(4000);

  const createNewClientDatabase = trpc.useMutation([
    "databases.create-user-database",
  ]);
  const deleteClientDatabase = trpc.useMutation([
    "databases.delete-user-database",
  ]);
  const createNewDatabaseFunction = async (data: {}) => {
    setDatabaseUpdateChange(false);
    await createNewClientDatabase.mutateAsync({
      hostId: "cl5ppx66s0029nccrad5nkg4o",
    });
    setDatabaseUpdateChange(true);
  };

  const onSubmit = () => {
    console.log("cooool");
  };

  const onDelete = async (database: any) => {
    setDatabaseUpdateChange(false);

    await deleteClientDatabase.mutateAsync({
      databaseId: database.id,
    });
    toast("warning", "Database Deleted");
    setDatabaseUpdateChange(true);
  };

  useEffect(() => {
    userDatabases.refetch();
  }, [databaseUpdateChange]);

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta
          name="description"
          content="Yeti wants to make your dev-ops easier"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FluidLayout>
        <>
          <div className="flex justify-end pr-10">
            <div className="tabs tabs-boxed">
              <button
                className="btn btn-primary"
                onClick={createNewDatabaseFunction}
              >
                Create New Database
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid w-2/3 grid-cols-3 gap-2">
              {userDatabases.data?.map((database) => (
                <div
                  className=" mockup-code w-5/6 bg-base-100 pt-4 pb-4 shadow-xl"
                  key={database.id}
                >
                  {DeleteModal(database, () => {
                    onDelete(database);
                  })}
                  <label
                    className="btn btn-square btn-sm absolute top-2 right-2"
                    htmlFor={"delete-modal-" + database?.id}
                  >
                    <XIcon className="h-5 w-5 text-red-500" />
                  </label>
                  <div className="card-body">
                    <h2 className="card-title">
                      {database.clientDatabaseName}
                    </h2>
                    <pre data-prefix="host" className="text-warning">
                      <code>{database.databaseHost.hostname}</code>
                    </pre>
                    <pre data-prefix="user">
                      <code>{database.clientUsername}</code>
                    </pre>
                    <pre data-prefix="pass">
                      <code>*******</code>
                    </pre>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Connection String</span>
                      </label>
                      <div className="input-group">
                        <select
                          className="select select-bordered"
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                        >
                          {clientStrings.map((client) => (
                            <option key={client.value} value={client.value}>
                              {client.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(
                                createCopyString(
                                  database,
                                  selectedClient
                                ) as string
                              )
                              .then(() => {
                                toast("info", "Copied to clipboard", onSubmit);
                              });
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="input input-bordered  w-full max-w-xs overflow-hidden text-clip pl-1 pr-1">
                      {selectedClient === "Postgres" && (
                        <code>
                          DATABASE_URL="postgres://user:******@server.net/database?sslaccept=strict"
                        </code>
                      )}
                      {selectedClient === "Prisma" && (
                        <code>
                          DATABASE_URL="postgres://{database.clientUsername}
                          :******@
                          {database.databaseHost.hostname}/
                          {database.clientDatabaseName}?sslaccept=strict"
                        </code>
                      )}
                      {selectedClient === "Laravel" && (
                        <>
                          DB_CONNECTION=mysql
                          {/* prettier-ignore */}
                          DB_DATABASE=cooldog
                          <br />
                          {/* prettier-ignore */}
                          DB_USER=k7dr8ttn7lcr
                          <br />
                          {/* prettier-ignore */}
                          DB_PASSWORD=************
                          <br />
                          {/* prettier-ignore */}
                          DB_HOST=775jzczq2daf.us-east-1.psdb.cloud
                          <br />
                          {/* prettier-ignore */}
                          DB_PORT=3306
                        </>
                      )}
                      {selectedClient === "Django" && (
                        <>
                          {/* prettier-ignore */}
                          DB_DATABASE=cooldog
                          <br />
                          {/* prettier-ignore */}
                          DB_USER=k7dr8ttn7lcr
                          <br />
                          {/* prettier-ignore */}
                          DB_PASSWORD=************
                          <br />
                          {/* prettier-ignore */}
                          DB_HOST=775jzczq2daf.us-east-1.psdb.cloud
                          <br />
                          {/* prettier-ignore */}
                          DB_PORT=5432
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      </FluidLayout>
    </>
  );
};

export default Home;
