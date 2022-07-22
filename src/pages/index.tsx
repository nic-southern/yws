import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { trpc } from "../utils/trpc";

import ListExamplePage from "../components/ExamplePages/ListExamples";

const Home: NextPage = () => {
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const repositories = trpc.useQuery(["github.get-repositories"]);
  const swarmpittest = trpc.useQuery(["swarmpit.services"]);

  return (
    <>
      <Head>
        <title>Yeti Web Services</title>
        <meta
          name="description"
          content="Yeti wants to make your dev-ops easier"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className="hero min-h-screen"
        style={{
          backgroundImage: "url(/assets/yeti.png)",
        }}
      >
        <div className="hero-content text-center text-neutral-content">
          <div className="card bg-neutral text-white">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Welcome!</h2>
              <p>
                {`Don't you wish the Yeti hosted all your databases and
                containerized apps? Now you can deploy your React projects with
                Postgres in one dashboard.`}
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Very Cool</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ListExamplePage />
    </>
  );
};

export default Home;
