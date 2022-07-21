import { trpc } from "../../utils/trpc";
import Head from "next/head";
import React, { createRef, Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  newServiceInput,
  newServiceInputObject,
} from "../../server/router/swarmpit";
import { randomString } from "../../utils/helpers";

import classes from "./NewAppModal.module.css";

const ModalOverlay = (props: any) => {
  const serviceRepository = createRef<any>();
  const servicePort = createRef<any>();
  const serviceName = createRef<any>();
  const serviceBranch = createRef<any>();
  const repositories = trpc.useQuery(["github.get-repositories"]);

  useEffect(() => {
    serviceName.current.value = randomString(12);
    servicePort.current.value = "3000";
  });

  const sendInputUp = () => {
    const sendData = {
      name: serviceName.current.value as string,
      branch: serviceBranch.current.value as string,
      repository: serviceRepository.current.value as string,
      servicePort: parseInt(servicePort.current.value) as number,
    } as newServiceInput;
    // We can send the trpc request to the backend now
    props.createNewService(sendData);
  };

  return (
    <Fragment>
      <input type="checkbox" id="new-app-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <h3 className="text-lg font-bold">Create a new application</h3>
          <p>
            <label className="input-group flex w-full">
              <span>Application Name</span>
              <input
                type="text"
                className="input input-bordered w-auto"
                ref={serviceName as any}
              />
            </label>
            <label>Select Next.js Repository</label>
            <select
              className="select select-bordered w-full"
              ref={serviceRepository}
            >
              {repositories.data?.map((repository) => (
                <option key={repository.id} value={repository.git_url}>
                  {repository.name}
                </option>
              ))}
            </select>
            <label>Select Branch</label>
            <select
              className="select select-bordered w-full"
              ref={serviceBranch}
              defaultValue="main"
            >
              <option value="main">main</option>
            </select>
            <label className="input-group flex w-full">
              <span>Service Port</span>
              <input
                type="number"
                className="input input-bordered w-auto"
                ref={servicePort as any}
              />
            </label>
          </p>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={sendInputUp}>
              Create
            </button>

            <label htmlFor="new-app-modal" className="btn">
              Cancel
            </label>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

const NewAppModal = (props: any) => {
  const createModalButtonRef = useRef<any>();

  const createNewServiceMutation = trpc.useMutation([
    "swarmpit.create-new-service",
  ]);
  const createAppMutation = trpc.useMutation(["apps.create-new-app"]);

  const createNewService = async (formInput: newServiceInput) => {
    createNewServiceMutation.mutateAsync(formInput);
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
