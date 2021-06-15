import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  goBack: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  blur: {
    height: 'calc(100% - 24px)',
    width: 'calc(100% - 24px)',
    position: 'absolute',
    margin: 12,
    inset: 0,
    zIndex: 2,
    backdropFilter: 'blur(7px)',
    borderRadius: 10,
  },
  marginBottom: {
    marginBottom: theme.spacing(2),
  },
}));