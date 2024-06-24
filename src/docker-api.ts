import { DockerApiUrl, WaitAttempts } from './environment';
import axios, { AxiosResponse } from 'axios';
import { logger } from './logger';

export class DockerApi {
    
    private DockerUrl: string;

    constructor() {
        this.DockerUrl = DockerApiUrl;
    }

    StartProfile(profile: string, callback: ((success: boolean) => void)) {
        try {
            logger.info(`Starting docker profile ${profile}`);
            this.RunCommand(`start/${profile}`).then((response) => {
                if (response.status == 200) {
                    logger.info(`Started ${profile}. Now waiting for it to come online.`);
                    this.WaitUntil(profile, true, WaitAttempts, callback);
                } else {
                    logger.info(`Received status ${response.status} when attempting to start ${profile}`);
                    callback(false);
                }
            }).catch((e) => {
                logger.error(e);
                callback(false);
            });
        } catch (e) {
            logger.error(e);
            callback(false);
        }
    }

    StopProfile(profile: string, callback: ((success: boolean) => void)) {
        try {
            logger.info(`Stopping docker profile ${profile}`);
            this.RunCommand(`stop/${profile}`).then((response) => {
                if (response.status == 200) {
                    logger.info(`Stopped ${profile}. Now waiting for it to fully shutdown.`);
                    this.WaitUntil(profile, false, WaitAttempts, callback);
                } else {
                    logger.info(`Received status ${response.status} when attempting to stop ${profile}`);
                    callback(false);
                }
            }).catch((e) => {
                logger.error(e);
                callback(false);
            });
        } catch (e) {
            logger.error(e);
            callback(false);
        }
    }

    WaitUntil(container: string, expectedStatus: boolean, attempts: number,  callback: ((success: boolean) => void)) {
        try {
            this.RunCommand(`status/${container}`).then((response) => {

                if (response.status == 200) {
                    if (response.data.isUp == expectedStatus) {
                        logger.info(`${container} reached expected status of ${expectedStatus ? 'up' : 'down'}`);
                        callback(true);
                    } else if (attempts > 0) {
                        setTimeout(() => {
                            this.WaitUntil(container, expectedStatus, attempts - 1, callback);
                        }, 5000);
                    } else {
                        logger.warn(`Reached max attepmts waiting for ${container}`);
                        callback(false);
                    }
                }
    
            }).catch((e) => {
                logger.error(e);
                callback(false);
            });
        } catch (e) {
            logger.error(e);
            setTimeout(() => {
                this.WaitUntil(container, expectedStatus, attempts - 1, callback);
            }, 5000);
        }
    }

    RunCommand(command: string) : Promise<AxiosResponse<any, any>> {
        let url = `${this.DockerUrl}${command}`;
        logger.info(`Calling url: ${url}`);
        return axios.get(url);
    }
}