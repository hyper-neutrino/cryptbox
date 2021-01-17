import Head from 'next/head';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Drawer, Toolbar, List, Typography, Divider, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import AppsIcon from '@material-ui/icons/Apps';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import DeleteIcon from '@material-ui/icons/Delete';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import Directory from '../../../components/Directory'
import FileInfo from '../../../components/FileInfo';

import styles from '../../../styles/User.module.css';

import getreq from '../../request-utils';

const drawerWidth = 300;

const testData = [
    {
        'encrypted_name': 'File 1',
        'extension': 'pdf',
        'modified': '12/30/2021 10:41 PM',
        'created': '12/30/2021 10:41 PM',
    },
    {
        'encrypted_name': 'File 2',
        'extension': 'png',
        'modified': '12/29/2021 10:41 PM',
        'created': '12/29/2021 10:41 PM',
    },
    {
        'encrypted_namev': 'File 3',
        'extension': 'folder',
        'modified': '12/3/2021 10:41 PM',
        'created': '12/3/2021 10:41 PM',
    }
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      paddingLeft: 285,
    },
  }),
);

function splitString(str, c) {
    let ret = [], curr = '';
    for(let i=0; i<str.length; i++){
        if(str[i] == c){
            if(curr.length > 0) ret.push(curr);
            curr = '';
        }else curr += str[i];
    }
    if(curr.length > 0) ret.push(curr);
    return ret;
}

export default function User(){
    const classes = useStyles();
    const router = useRouter();

    const [fvstate, setFVState] = useState("My Files");

    let [currentFolder, setCurrentFolder] = useState(0);
    let [parentFolder, setParentFolder] = useState(0);
    let [children, setChildren] = useState(null);

    let [firstTime, setFirstTime] = useState(true);
    let [baseDirectoryIDs, setBaseIDs] = useState({});

    const handleListItemClick =(event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: string)=>{
        setFVState(index)
    }

    function submitLogout() {
        localStorage.removeItem('username');
        router.push('/');
    }

    function closeInfo() {
        router.push('/user');
    }

    useEffect(() => {
      getreq('/directory/' + currentFolder, data => {
        if (data['status'] != 'ok'){

        } else{
          setParentFolder(data['parent']);
          setChildren(data['children']);
        }
      });
    }, [currentFolder]);

    useEffect(() => {
        setCurrentFolder(baseDirectoryIDs[fvstate]);
    }, [fvstate]);

    let urlPath = splitString(router.pathname, '/');
    let fileID = '';

    if(urlPath.length > 3) return null; //doesnt exist
    else if(urlPath.length == 3 && urlPath[1] == 'file') fileID = 'move';
    else if(urlPath.length == 1) fileID = '';
    else return null; //doesnt exist

    if(firstTime){
        setFirstTime(false);
        getreq('/user/dirs', data => {
          if (data['status'] != 'ok') {

          } else {
              let ret = {
                  'My Files': data['home'],
                  'Shared With Me': data['shared'],
                  'Trash': data['trash']
              };
              setBaseIDs(ret);
          }
        });
    }

    return(
        <div>
            <div style = {{ position: 'fixed', left: 0, height: '100vh', width: '230px', top: '-9px', background: 'rgba(0,0,0,0.02)' }}>
                <List>
                    <ListItem button selected={fvstate === "My Files"} key={"My Files"} onClick={(ev)=>{handleListItemClick(ev, "My Files")}}>
                        <ListItemIcon><AppsIcon /></ListItemIcon>
                        <h1 className = { styles.sidebarText }> MY FILES </h1>
                    </ListItem>
                    <ListItem button selected={fvstate === "Shared With Me"} key={"Shared With Me"} onClick={(ev)=>{handleListItemClick(ev, "Shared With Me")}}>
                        <ListItemIcon><FolderSharedIcon /></ListItemIcon>
                        <h1 className = { styles.sidebarText }> SHARED WITH ME </h1>
                    </ListItem>
                    <ListItem button selected={fvstate === "Trash"} key={"Trash"} onClick={(ev)=>{handleListItemClick(ev, "Trash")}}>
                        <ListItemIcon><DeleteIcon /></ListItemIcon>
                        <h1 className = { styles.sidebarText }> TRASH </h1>
                    </ListItem>
                    <Divider />
                    <ListItem button key={"Logout"} onClick = { submitLogout }>
                        <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                        <h1 className = { styles.sidebarText }> LOGOUT </h1>
                    </ListItem>
                </List>
            </div>
            <div className = { styles.userBackground }>
                <h1 className = { styles.userHeader }> { fvstate } </h1>
                <div className = { styles.filesBackground }>
                    <Directory data = { null } changeDirectory = { null } isFirst = { true } isLast = { false } />
                    {
                        testData.map((value, index) => {
                            return <Directory data = { value } changeDirectory = { setCurrentFolder } isFirst = { false } isLast = { index == testData.length-1 } />
                        })
                    }
                </div>
            </div>
            {
                fileID == ''?
                null:
                <FileInfo closeInfo = { closeInfo } />
            }
        </div>
    )
}