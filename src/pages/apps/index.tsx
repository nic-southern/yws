import type { NextPage } from "next";
import Head from "next/head";
import React, { createRef, useEffect, useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import FluidLayout from "../../components/UI/FluidLayout";
import { Prisma } from "@prisma/client";
import NewAppModal from "../../components/Apps/NewAppModal";
import { useToast } from "../../utils/hooks";
import { XIcon } from "@heroicons/react/solid";

const DeleteModal = (userApp: any, onConfirm: any) => {
  const confirmRef = createRef<HTMLInputElement>();
  const toggleref = createRef<HTMLLabelElement>();
  const toast = useToast(4000);

  const validateDelete = () => {
    // check the value of the input vs the name
    if (confirmRef?.current?.value !== userApp.appName) {
      toast("error", "You must match the name to delete the app");
      return false;
    }
    toggleref?.current?.click();
    onConfirm();
  };

  return (
    <>
      <input
        type="checkbox"
        id={"delete-modal-" + userApp?.id}
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box bg-red-200 text-primary-content">
          <h3 className="text-lg font-bold">Remove App?</h3>
          <p className="py-4">
            Are you sure you want to remove this App?
            <i className="text-red-500">This action is not reversible!</i> To
            remove please enter in the user of the App below. (
            {userApp?.appName})
          </p>
          <input
            type="text"
            placeholder={userApp?.appName}
            ref={confirmRef}
            className="input input-bordered input-ghost input-error w-full max-w-xs text-black"
          />
          <div className="modal-action">
            <label
              ref={toggleref}
              hidden
              htmlFor={"delete-modal-" + userApp?.id}
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
  const userApps = trpc.useQuery(["apps.get-user-apps"]);
  const deleteClientApp = trpc.useMutation(["apps.delete-client-app"]);
  const deleteClientContainer = trpc.useMutation("swarmpit.remove-service");

  const [newAppAdded, setNewAppAdded] = useState(1);
  useEffect(() => {
    userApps.refetch();
  }, [newAppAdded]);

  const appsListUpdateEvent = () => {
    setNewAppAdded(newAppAdded + 1);
  };

  const onDelete = async (id: string) => {
    await deleteClientContainer.mutateAsync({
      id: id,
    });
    await deleteClientApp.mutateAsync({
      id: id,
    });
    appsListUpdateEvent();
  };

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
              <NewAppModal onCreate={appsListUpdateEvent} />
            </div>
          </div>
          <div className="flex justify-center space-y-4">
            <div className="justi grid w-5/6 grid-cols-2 gap-2">
              {userApps.data?.map((userApp) => (
                <div
                  className=" mockup-code w-5/6 bg-base-100 shadow-xl"
                  key={userApp.id}
                >
                  {DeleteModal(userApp, () => {
                    onDelete(userApp.id);
                  })}
                  <label
                    className="btn btn-square btn-sm absolute top-2 right-2"
                    htmlFor={"delete-modal-" + userApp?.id}
                  >
                    <XIcon className="h-5 w-5 text-red-500" />
                  </label>
                  <div className="card-body">
                    <h2 className="card-title">{userApp.appName}</h2>
                    <pre data-prefix="URL" className="text-warning">
                      <code>
                        <a
                          href={`https://${userApp.appName}.dev.nsouthern.com`}
                          target="blank"
                        >
                          https://{userApp.appName}.dev.nsouthern.com
                        </a>
                      </code>
                    </pre>
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
