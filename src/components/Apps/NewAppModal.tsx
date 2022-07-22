import { trpc } from "../../utils/trpc";
import Head from "next/head";
import React, { createRef, Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  newServiceInput,
  newServiceInputObject,
} from "../../server/router/swarmpit";
import { randomString } from "../../utils/helpers";
import { useToast } from "../../utils/hooks";
import { RefreshIcon, BeakerIcon } from "@heroicons/react/solid";
import { useForm, Resolver } from "react-hook-form";

import classes from "./NewAppModal.module.css";

/* eslint-disable react-hooks/exhaustive-deps */

type NewAppFormValues = {
  name: string;
  branch: string;
  repository: string;
  servicePort: number;
  database: string;
  environment: any;
};

const resolver: Resolver<NewAppFormValues> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
          name: {
            type: "required",
            message: "This is required.",
          },
        }
      : {},
  };
};

const ModalOverlay = (props: any) => {
  const toast = useToast(400);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewAppFormValues>({
    resolver,
    defaultValues: {
      name: randomString(8),
      branch: "main",
      repository: "",
      servicePort: 3000,
    },
  });
  const watchFields = watch(["database"]);

  const repositories = trpc.useQuery(["github.get-repositories"]);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Second page - Database attachment
  const availableDatabases = trpc.useQuery(["databases.get-user-databases"]);
  const selectedDatabase = createRef<HTMLSelectElement>();
  const newDatabaseButton = createRef<HTMLButtonElement>();
  const [databaseUpdateChange, setDatabaseUpdateChange] = useState(true);
  const createNewClientDatabase = trpc.useMutation([
    "databases.create-user-database",
  ]);
  const [createdDatabaseId, setCreatedDatabaseId] = useState<string>();

  useEffect(() => {
    availableDatabases.refetch();
  }, [databaseUpdateChange]);

  useEffect(() => {
    if (createdDatabaseId && selectedDatabase && selectedDatabase.current) {
      selectedDatabase.current.value = createdDatabaseId?.toString();
    }
  }, [availableDatabases]);

  const createNewDatabaseFunction = async (data: {}) => {
    setDatabaseUpdateChange(false);
    newDatabaseButton.current?.setAttribute("disabled", "disabled");
    const newdatabase = await createNewClientDatabase.mutateAsync({
      hostId: "cl5ppx66s0029nccrad5nkg4o",
    });
    toast("success", "Database created");
    setDatabaseUpdateChange(true);
    // Also set the current selected database to the new one
    setCreatedDatabaseId(newdatabase.id);
    setValue("database", newdatabase.id);
  };

  const onSubmit = handleSubmit((data) => {
    data.servicePort = Number(data.servicePort);
    props.createNewService(data);
  });

  return (
    <Fragment>
      <input type="checkbox" id="new-app-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <form onSubmit={onSubmit}>
            <h3 className="text-lg font-bold">Create a new application</h3>
            <div className="divider"></div>
            <div className="flex-full tabs w-fit">
              <a
                onClick={() => setCurrentStep(1)}
                className={
                  "tab tab-bordered" + (currentStep === 1 ? " tab-active" : "")
                }
              >
                Application Settings
              </a>
              <a
                onClick={() => setCurrentStep(2)}
                className={
                  "tab tab-bordered" + (currentStep === 2 ? " tab-active" : "")
                }
              >
                Attach Database
              </a>
              <a
                onClick={() => setCurrentStep(3)}
                className={
                  "tab tab-bordered" + (currentStep === 3 ? " tab-active" : "")
                }
              >
                Environment
              </a>
            </div>
            <p>
              {currentStep === 1 && (
                <>
                  <label className="input-group flex w-full">
                    <span className="w-full justify-center pt-2 pb-2 font-semibold">
                      Application Settings
                    </span>
                  </label>
                  <label className="input-group flex w-full">
                    <span className="w-32">Name</span>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      className="input input-bordered w-fit"
                    />
                    <span className="btn btn-ghost">
                      <RefreshIcon className="h-5 w-5 text-blue-500" />
                    </span>
                  </label>
                  <label className="input-group flex w-full">
                    <span className="w-32">Repo</span>
                    <select
                      className="select select-bordered w-fit justify-end"
                      {...register("repository", { required: true })}
                    >
                      <option value="">Select</option>
                      {repositories.data?.map((repository) => (
                        <option key={repository.id} value={repository.git_url}>
                          {repository.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="input-group flex w-full">
                    <span className="w-32">Select Branch</span>
                    <select
                      {...register("branch", { required: true })}
                      className="select select-bordered w-fit justify-end"
                      defaultValue="main"
                    >
                      <option value="main">main</option>
                    </select>
                  </label>
                  <label className="input-group flex w-full">
                    <span className="w-32">Service Port</span>
                    <input
                      {...register("servicePort", { required: true })}
                      type="number"
                      className="input input-bordered w-auto"
                    />
                  </label>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setCurrentStep(currentStep + 1);
                    }}
                  >
                    Next
                  </button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <label className="input-group flex w-full">
                    <span className="w-full justify-center pt-2 pb-2 font-semibold">
                      Select Existing Database
                    </span>
                  </label>
                  <label className="input-group flex w-full">
                    <span className="w-32">Database</span>
                    <select
                      className="select select-bordered w-fit justify-end"
                      ref={selectedDatabase}
                      onChange={(e) => setValue("database", e.target.value)}
                    >
                      <option value="">Select</option>
                      {availableDatabases.data?.map((database) => (
                        <option key={database.id} value={database.id}>
                          {database.clientDatabaseName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="divider">OR</span>
                  <label className="input-group flex w-full  justify-center">
                    <button
                      className="btn btn-primary"
                      onClick={createNewDatabaseFunction}
                      ref={newDatabaseButton}
                    >
                      Create New Database
                    </button>
                  </label>
                </>
              )}
            </p>
            <div className="modal-action">
              <input className="btn btn-primary" type="submit" value="Create" />
              <label htmlFor="new-app-modal" className="btn">
                Cancel
              </label>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

const NewAppModal = (props: any) => {
  const createModalButtonRef = useRef<any>();

  const createAppMutation = trpc.useMutation(["apps.create-new-app"]);

  const createNewService = async (formInput: newServiceInput) => {
    await createAppMutation.mutateAsync(formInput);
    props.onCreate();
    createModalButtonRef.current.click();
  };

  return (
    <Fragment>
      <ModalOverlay
        createModalButtonRef={createModalButtonRef}
        createNewService={createNewService}
      />
      <label
        htmlFor="new-app-modal"
        className="modal-button btn btn-primary"
        ref={createModalButtonRef}
      >
        Create New App
      </label>
    </Fragment>
  );
};

export default NewAppModal;
