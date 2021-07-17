//declarion metrging , we are mergeing our db env varibles into NodeJs namespace
declare namespace NodeJS {

    interface ProcessEnv {
        MYSQL_HOST: string
        MYSQL_USER: string
        MYSQL_DTABASE: string
        MYSQL_PASSWORD: string
    }

}